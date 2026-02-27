import type { TokenType } from '@/lib/auth/utils';

export type TUser = {
  id: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  userName: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type UserResponse = {
  statusCode: number;
  message: string;
  timestamp: string;
  data: TokenType & {
    user: TUser;
  };
};
