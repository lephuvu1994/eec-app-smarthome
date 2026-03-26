import type { TConfig, TConfigState } from './types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

const initialConfigState: TConfig = {
  showCameraPreview: false,
  showRoomViewExpand: true,
  allowHaptics: true,
  deviceViewMode: 'grouped',
  shutterBackgrounds: {},
};

const _useConfig = create<TConfigState>()(
  persist(
    (set, get) => ({
      ...initialConfigState,
      setShowCameraPreview: (showCameraPreview: boolean) => {
        set({ showCameraPreview });
      },
      setShowRoomViewExpand: (showRoomViewExpand: boolean) => {
        set({ showRoomViewExpand });
      },
      setToggleAllowHaptics: (allowHaptics: boolean) => {
        set({ allowHaptics });
      },
      setDeviceViewMode: (deviceViewMode: 'grouped' | 'split') => {
        set({ deviceViewMode });
      },
      setShutterBackground: (deviceId: string, backgroundId: string) => {
        set({
          shutterBackgrounds: {
            ...get().shutterBackgrounds,
            [deviceId]: backgroundId,
          },
        });
      },
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useConfigManager = createSelectors(_useConfig);
