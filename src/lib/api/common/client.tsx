import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import Env from '@env';
import axios from 'axios';
import get from 'lodash/get';
import { useUserManager } from '@/features/auth/user-store';

export const TIMEOUT = 10000;
const API_VERSION = '/v1';

function createBaseConfig(baseURL?: string, headers?: object): AxiosRequestConfig {
  return {
    baseURL,
    headers: {
      'Accept-Language': 'en-US',
      'Content-type': 'application/json',
      'Cache-Control': 'no-cache',
      ...headers,
    },
    withCredentials: true,
    timeout: TIMEOUT,
  };
}

function setupAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Update baseURL before each request
      config.baseURL = Env.EXPO_PUBLIC_API_URL + API_VERSION;

      const accessToken = useUserManager.getState().accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    error => Promise.reject(error),
  );

  instance.interceptors.response.use(
    response => response,
    async (error) => {
      const statusCode = get(error, 'response.status');
      const prevRequest = error?.config;
      if (statusCode === 401 && !prevRequest?._retry) {
        prevRequest._retry = true;
        const refreshToken = useUserManager.getState().refreshToken;
        if (refreshToken) {
          const state = useUserManager.getState();
          try {
            const { data } = await instance.post('/refreshToken', {
              refreshToken,
            });
            state.updateToken({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken ?? refreshToken,
            });
            return instance(prevRequest);
          }
          catch (refreshError) {
            console.log('[Auth] Refresh token failed:', refreshError);
            console.log('[Auth] Original request:', prevRequest?.url);
            state.signOut();
          }
        }
      }
      return Promise.reject(
        get(error, 'response.data.message')
        || get(error, 'response.data.error.message')
        || get(error, 'message'),
      );
    },
  );

  return instance;
}

export function createService(headers?: object): AxiosInstance {
  // Initialize with current baseUrl but it will be updated on each request
  const baseURL = Env.EXPO_PUBLIC_API_URL + API_VERSION;
  const axiosInstance = axios.create(createBaseConfig(baseURL, headers));
  return setupAuthInterceptor(axiosInstance);
}

// Create a singleton instance
export const client = createService();
