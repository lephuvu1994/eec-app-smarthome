import type { THomeManagerStoreState } from './types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

const _useHomeManager = create<THomeManagerStoreState>()(
  persist(
    set => ({
      homes: [],
      selectedHome: null,
      selectedHomeId: null, // Luôn sync với selectedHome.id
      selectedHomeRole: null,

      setHomes: (homes) => {
        set({ homes });
      },

      setSelectedHome: (home, role) => {
        set({
          selectedHome: home,
          selectedHomeId: home.id, // Sync explicit
          selectedHomeRole: role,
        });
      },

      clearSelectedHome: () => {
        set({ selectedHome: null, selectedHomeId: null, selectedHomeRole: null });
      },
    }),
    {
      name: 'home-manager-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        homes: state.homes,
        selectedHome: state.selectedHome,
        selectedHomeId: state.selectedHomeId,
        selectedHomeRole: state.selectedHomeRole,
      }),
    },
  ),
);

export const useHomeManager = createSelectors(_useHomeManager);

// Backward compat alias
export const useHomeStore = useHomeManager;
