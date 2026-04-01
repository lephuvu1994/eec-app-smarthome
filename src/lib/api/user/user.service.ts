import type { TUser } from '@/features/auth/types/response';
import { client } from '../common';

export type UserUpdateDto = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
};

export const userService = {
  /**
   * Update the currently authenticated user's profile
   */
  updateProfile: async (data: UserUpdateDto): Promise<TUser> => {
    // Calling the core-api endpoint: PUT /v1/user
    const response = await client.put('/user', data);
    // Usually enveloped as { statusCode, message, data }
    return response.data.data || response.data;
  },
};
