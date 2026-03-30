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
  updateDevice: (id: string, override: Partial<TDevice>) => void;
  updateDeviceStatus: (id: string, status: EDeviceStatus) => void;
  updateDeviceEntity: (
    id: string,
    entityCode: string,
    updates: { name?: string; state?: any; attributes?: Array<{ key: string; value: string | number }> },
  ) => void;
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

      updateDevice: (id, override) => {
        set({
          devices: get().devices.map(d =>
            d.id === id ? { ...d, ...override } : d,
          ),
        });
      },

      updateDeviceStatus: (id, status) => {
        set({
          devices: get().devices.map(d =>
            d.id === id ? { ...d, status } : d,
          ),
        });
      },

      updateDeviceEntity: (id, entityCode, updates) => {
        set({
          devices: get().devices.map((d) => {
            if (d.id !== id || !d.entities) {
              return d;
            }

            const updatedEntities = d.entities.map((e) => {
              if (e.code !== entityCode) {
                return e;
              }

              const newEntity = { ...e };
              if (updates.name !== undefined) {
                newEntity.name = updates.name;
              }

              if (updates.state !== undefined) {
                newEntity.currentState = updates.state;
              }

              if (updates.attributes && updates.attributes.length > 0) {
                const updatedAttributes = [...(e.attributes || [])];
                for (const updatedAttr of updates.attributes) {
                  // Find existing attribute and merge
                  const index = updatedAttributes.findIndex(a => a.key === updatedAttr.key);
                  if (index >= 0) {
                    updatedAttributes[index] = {
                      ...updatedAttributes[index],
                      currentValue: updatedAttr.value,
                      numValue: typeof updatedAttr.value === 'number' ? updatedAttr.value : updatedAttributes[index].numValue,
                      strValue: typeof updatedAttr.value === 'string' ? updatedAttr.value : updatedAttributes[index].strValue,
                    };
                  }
                  else {
                    // Note: We don't construct fully new attributes here if they don't exist in DB schema
                    // because we only care to update known properties for the UI.
                    // But if it's completely missing, we inject a minimal representation for UI hooks to read.
                    updatedAttributes.push({
                      key: updatedAttr.key,
                      currentValue: updatedAttr.value,
                      numValue: typeof updatedAttr.value === 'number' ? updatedAttr.value : null,
                      strValue: typeof updatedAttr.value === 'string' ? updatedAttr.value : null,
                    } as any);
                  }
                }
                newEntity.attributes = updatedAttributes;
              }

              return newEntity;
            });

            return { ...d, entities: updatedEntities };
          }),
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
