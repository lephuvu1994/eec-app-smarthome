import type { type EDeviceStatus, TDevice } from '@/lib/api/devices/device.service';

import { create } from 'zustand';

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
// STORE (no persist — refetch on app open)
// ============================================================
const _useDeviceStore = create<TDeviceStoreState>()(
  (set, get) => ({
    devices: [],
    isLoading: false,

    setDevices: devices => set({ devices, isLoading: false }),

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
);

export const useDeviceStore = createSelectors(_useDeviceStore);
