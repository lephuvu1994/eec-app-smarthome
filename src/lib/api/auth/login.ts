/* eslint-disable e18e/ban-dependencies */
import type { AxiosError } from 'axios';
import type { UserResponse } from '@/features/auth/types/response';

import { createMutation } from 'react-query-kit';
import { client } from '../common';

type Variables = { identifier: string; password: string };
type Response = UserResponse;

export const useLogin = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) => {
    const resultData = await client.post<UserResponse>('/auth/login', variables);
    return resultData.data;
  },
});
