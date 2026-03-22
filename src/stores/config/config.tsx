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
};

const _useConfig = create<TConfigState>()(
  persist(
    set => ({
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
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useConfigManager = createSelectors(_useConfig);
