import type { TConfig, TConfigState } from './types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

const initialConfigState: TConfig = {
  showCameraPreview: false,
};

const _useConfig = create<TConfigState>()(
  persist(
    set => ({
      ...initialConfigState,
      setShowCameraPreview: (showCameraPreview: boolean) => {
        set({ showCameraPreview });
      },
    }),
    {
      name: 'config-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useConfigManager = createSelectors(_useConfig);
