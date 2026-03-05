export type TTokenType = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type TUser = TTokenType & {
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
  data: {
    user: TUser;
    accessToken: string;
    refreshToken: string;
  };
};
