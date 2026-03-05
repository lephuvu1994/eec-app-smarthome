import type { TTokenType, TUser } from './types/response';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { client } from '@/lib/api';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';
import { EAuthStatus } from './types/enum';

export type UserState = TUser & {
  status: EAuthStatus;
  signIn: (user: TUser) => void;
  signOut: () => void;
  updateToken: (token: TTokenType) => void;
  hydrateAuth: () => Promise<void>;
};

// Giá trị khởi tạo mặc định khi chưa có user
const initialUserState: TUser = {
  id: '',
  email: null,
  phone: null,
  avatar: null,
  userName: '',
  role: '',
  created_at: '',
  updated_at: '',
  accessToken: null,
  refreshToken: null,
};

const _useGetUser = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialUserState,
      status: EAuthStatus.idle,
      signIn: (user) => {
        set({ ...user, status: EAuthStatus.signIn });
      },
      signOut: () => {
        const currentState = get();
        set({
          ...currentState,
          ...initialUserState,
          status: EAuthStatus.signOut,
        });
      },
      updateToken: (token: TTokenType) => {
        const currentState = get();
        set({
          ...currentState,
          ...token,
        });
      },
      hydrateAuth: async () => {
        const currentState = get();
        try {
          // Call API to call profile
          // const profileUpdate = await client.get('/me');
          set({
            ...currentState,
            // ...profileUpdate,
            status: EAuthStatus.signIn,
          });
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (e) {
          currentState.signOut();
        }
      },
    }),
    {
      name: 'user-storage', // Key duy nhất để lưu trong MMKV
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useUserManager = createSelectors(_useGetUser);
export const hydrateAuth = useUserManager.getState().hydrateAuth;
