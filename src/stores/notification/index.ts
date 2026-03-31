import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
type TNotificationStoreState = {
  /** The last Expo Push Token that was successfully synced to the server */
  lastSyncedToken: string | null;
  /** Timestamp (ms) of the last successful sync */
  syncedAt: number | null;

  // Actions
  setLastSyncedToken: (token: string) => void;
  clearToken: () => void;
};

// ============================================================
// STORE (Persisted via MMKV)
// ============================================================
const _useNotificationStore = create<TNotificationStoreState>()(
  persist(
    set => ({
      lastSyncedToken: null,
      syncedAt: null,

      setLastSyncedToken: (token: string) =>
        set({ lastSyncedToken: token, syncedAt: Date.now() }),

      clearToken: () =>
        set({ lastSyncedToken: null, syncedAt: null }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export const useNotificationStore = createSelectors(_useNotificationStore);
