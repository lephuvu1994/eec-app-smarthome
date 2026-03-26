import type { TTokenType, TUser } from './types/response';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { deviceService } from '@/lib/api/devices/device.service';
import { MqttManager } from '@/lib/mqtt/mqtt-manager';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';
import { useHomeStore } from '@/stores/home/home-store';
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
        // Connect MQTT — pass credentials fetcher to avoid require cycle
        if (user.accessToken) {
          MqttManager.getInstance().connect(deviceService.getMqttCredentials);
        }
      },
      signOut: () => {
        const currentState = get();
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
      hydrateAuth: async () => {
        const currentState = get();
        try {
          if (!currentState.accessToken) {
            get().signOut();
            return;
          }
          set({
            ...currentState,
            status: EAuthStatus.signIn,
          });
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
