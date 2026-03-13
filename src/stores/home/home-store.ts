import type { THomeStoreState } from './types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

const _useHomeStore = create<THomeStoreState>()(
  persist(
    set => ({
      selectedHomeId: null,
      setSelectedHomeId: (id: string) => {
        set({ selectedHomeId: id });
      },
    }),
    {
      name: 'home-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useHomeStore = createSelectors(_useHomeStore);
