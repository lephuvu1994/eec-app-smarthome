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
  shutterDeviceTypes: {},
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
      setShutterDeviceType: (deviceId: string, typeId: string) => {
        set({
          shutterDeviceTypes: {
            ...get().shutterDeviceTypes,
            [deviceId]: typeId,
          },
        });
      },
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Migrate old shutterBackgrounds → shutterDeviceTypes
      migrate: (persistedState: any, _: number) => {
        if (persistedState?.shutterBackgrounds && !persistedState?.shutterDeviceTypes) {
          persistedState.shutterDeviceTypes = persistedState.shutterBackgrounds;
          delete persistedState.shutterBackgrounds;
        }
        return persistedState;
      },
      version: 1,
    },
  ),
);

export const useConfigManager = createSelectors(_useConfig);
