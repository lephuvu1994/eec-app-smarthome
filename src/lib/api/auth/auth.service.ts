import type { EHomeRole } from '@/features/auth/types/response';
import * as Device from 'expo-device';
import { client } from '../common';

// ============================================================
// TYPES
// ============================================================
export type TAuthHome = {
  id: string;
  name: string;
  role: EHomeRole;
};

export type TAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
  };
  homes: TAuthHome[];
};

export type TAuthMeResponse = {
  user: TAuthResponse['user'];
  homes: TAuthHome[];
};

export type TCheckExistsResponse = {
  exists: boolean;
};

export type TSignupVariables = {
  identifier: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

// ============================================================
// API SERVICE
// ============================================================
export const authService = {
  checkExists: async (identifier: string): Promise<TCheckExistsResponse> => {
    const { data } = await client.post('/auth/check-exists', { identifier });
    return data.data || data;
  },

  /** Get current user profile and list of joined homes */
  getMe: async (): Promise<TAuthMeResponse> => {
    const { data } = await client.get('/auth/me');
    return data.data || data;
  },

  /** Register a new user account */
  signup: async (variables: TSignupVariables): Promise<TAuthResponse> => {
    const { data } = await client.post('/auth/signup', variables);
    return data.data || data;
  },

  /** Login with email/phone + password */
  login: async (identifier: string, password: string): Promise<TAuthResponse> => {
    const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
    const { data } = await client.post('/auth/login', {
      identifier,
      password,
      deviceName,
    });
    return data.data || data;
  },

  /** Request OTP for forgot password (Step 1) */
  forgotPassword: async (identifier: string): Promise<void> => {
    await client.post('/auth/forgot-password', { identifier });
  },

  /** Verify OTP (Step 2) — returns resetToken */
  verifyOtp: async (identifier: string, otp: string): Promise<{ resetToken: string }> => {
    const { data } = await client.post('/auth/forgot-password/verify', { identifier, otp });
    return data.data || data;
  },

  resetPassword: async (identifier: string, newPassword: string, resetToken: string): Promise<void> => {
    await client.post('/auth/forgot-password/reset-password', { identifier, newPassword, resetToken });
  },

  /** Update Expo Push Token for the current session */
  updatePushToken: async (pushToken: string | null): Promise<void> => {
    await client.patch('/user/sessions/push-token', { pushToken });
  },
  /** Logout current session */
  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },
};
