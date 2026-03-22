import type { EDeviceStatus, TDevice } from '@/lib/api/devices/device.service';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
type TDeviceStoreState = {
  devices: TDevice[];
  isLoading: boolean;

  setDevices: (devices: TDevice[]) => void;
  setLoading: (loading: boolean) => void;
  updateDeviceStatus: (id: string, status: EDeviceStatus) => void;
  reorderInRoom: (roomId: string, orderedIds: string[]) => void;
  clear: () => void;
};

// ============================================================
// STORE (Persisted via MMKV for Zero-Latency App Load)
// ============================================================
const _useDeviceStore = create<TDeviceStoreState>()(
  persist(
    (set, get) => ({
      devices: [],
      isLoading: false,

      // Do NOT set isLoading to false here automatically to avoid flickers
      setDevices: devices => set({ devices }),

      setLoading: isLoading => set({ isLoading }),

      updateDeviceStatus: (id, status) => {
        set({
          devices: get().devices.map(d =>
            d.id === id ? { ...d, status } : d,
          ),
        });
      },

      reorderInRoom: (roomId, orderedIds) => {
        const { devices } = get();
        const roomDevices = devices.filter(d => d.room?.id === roomId);
        const otherDevices = devices.filter(d => d.room?.id !== roomId);

        // Reorder room devices to match orderedIds
        const reordered = orderedIds
          .map(id => roomDevices.find(d => d.id === id))
          .filter(Boolean) as TDevice[];

        set({ devices: [...otherDevices, ...reordered] });
      },

      clear: () => set({ devices: [], isLoading: false }),
    }),
    {
      name: 'device-data-storage', // Tên unique cho MMKV key
      storage: createJSONStorage(() => mmkvStorage),
      // Bỏ qua isLoading khỏi cache
      partialize: state => ({ devices: state.devices }),
    },
  ),
);

export const useDeviceStore = createSelectors(_useDeviceStore);
