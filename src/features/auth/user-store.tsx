import type { TTokenType, TUser } from './types/response';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authService } from '@/lib/api/auth/auth.service';
import { MqttManager } from '@/lib/mqtt/mqtt-manager';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';
import { useHomeStore } from '@/stores/home/home-store';
import { EAuthStatus } from './types/enum';

export type UserState = TUser & {
  status: EAuthStatus;
  signIn: (user: TUser) => void;
  signOut: () => Promise<void>;
  updateToken: (token: TTokenType) => void;
  updateUser: (update: Partial<TUser>) => void;
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
        // Connect MQTT — dynamic import breaks the require cycle:
        // user-store → deviceService → client → user-store
        if (user.accessToken) {
          MqttManager.getInstance().connect(
            () => import('@/lib/api/devices/device.service')
              .then(m => m.deviceService.getMqttCredentials()),
          );
        }
      },
      signOut: async () => {
        const currentState = get();
        // 1. Call backend to revoke session (optional, but good for stateful logout)
        try {
          if (currentState.accessToken) {
            await authService.logout();
          }
        }
        catch (err) {
          console.warn('[UserStore] Logout API failed:', err);
        }

        // 2. Local Cleanup
        // Disconnect MQTT
        MqttManager.getInstance().disconnect();
        // Clear home data khi logout để tránh stale homeId
        useHomeStore.getState().clearSelectedHome();
        useHomeStore.getState().setHomes([]);
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
      updateUser: (update: Partial<TUser>) => {
        const currentState = get();
        set({
          ...currentState,
          ...update,
        });
      },
      hydrateAuth: async () => {
        const currentState = get();
        try {
          if (!currentState.accessToken) {
            await get().signOut();
            return;
          }
          set({
            ...currentState,
            status: EAuthStatus.signIn,
          });

          // Connect MQTT on app load for already authenticated users
          MqttManager.getInstance().connect(
            () => import('@/lib/api/devices/device.service')
              .then(m => m.deviceService.getMqttCredentials()),
          );
        }
        catch {
          set({ status: EAuthStatus.signIn });
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
