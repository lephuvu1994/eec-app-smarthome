import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { TokenType } from '@/lib/auth/utils';
import Env from '@env';
import axios from 'axios';
import get from 'lodash/get';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { getToken } from '@/lib/auth/utils';

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

      const token: TokenType | null = getToken();
      if (token?.accessToken) {
        config.headers.Authorization = `Bearer ${token.accessToken}`;
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
      const { signOut, signIn } = useAuthStore.getState();
      if (statusCode === 401) {
        const token = getToken();
        if (token?.refreshToken) {
          try {
            const { data } = await instance.post('/refreshToken', {
              refreshToken: token.refreshToken,
            });

            signIn({
              accessToken: data.accessToken,
              refreshToken: token.refreshToken,
            });

            return instance(prevRequest);
          }
          catch {
            console.log('error', error);
            signOut();
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
