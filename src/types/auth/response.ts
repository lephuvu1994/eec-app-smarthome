import type { TAuthHome } from './base';

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
