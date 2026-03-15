import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
type TFavoriteStoreState = {
  favoriteIds: string[];

  toggleFavorite: (deviceId: string) => void;
  isFavorite: (deviceId: string) => boolean;
  clearFavorites: () => void;
};

// ============================================================
// STORE (MMKV persist — local-only, per-user preference)
// ============================================================
const _useFavoriteStore = create<TFavoriteStoreState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (deviceId) => {
        const { favoriteIds } = get();
        const exists = favoriteIds.includes(deviceId);
        set({
          favoriteIds: exists
            ? favoriteIds.filter(id => id !== deviceId)
            : [...favoriteIds, deviceId],
        });
      },

      isFavorite: (deviceId) => {
        return get().favoriteIds.includes(deviceId);
      },

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'favorite-devices-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({ favoriteIds: state.favoriteIds }),
    },
  ),
);

export const useFavoriteStore = createSelectors(_useFavoriteStore);
