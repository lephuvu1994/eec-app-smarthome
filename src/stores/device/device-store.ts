import type { EDeviceStatus, TDevice } from '@/types/device';
import isEqual from 'lodash.isequal';

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
    updates: { name?: string; state?: any; attributes?: Array<{ key: string; value: any }> },
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
          devices: get().devices.map((d) => {
            if (d.id !== id)
              return d;

            // Validate if changes are actually different
            let hasChanged = false;
            for (const key of Object.keys(override)) {
              if (!isEqual((d as any)[key], (override as any)[key])) {
                hasChanged = true;
                break;
              }
            }
            if (!hasChanged)
              return d;

            return { ...d, ...override };
          }),
        });
      },

      updateDeviceStatus: (id, status) => {
        set({
          devices: get().devices.map((d) => {
            if (d.id !== id || d.status === status)
              return d;
            return { ...d, status };
          }),
        });
      },

      updateDeviceEntity: (id, entityCode, updates) => {
        set({
          devices: get().devices.map((d) => {
            if (d.id !== id || !d.entities) {
              return d;
            }

            let isDeviceEntitiesChanged = false;
            const updatedEntities = d.entities.map((e) => {
              if (e.code !== entityCode) {
                return e;
              }

              const newEntity = { ...e };
              let isEntityChanged = false;

              if (updates.name !== undefined && newEntity.name !== updates.name) {
                newEntity.name = updates.name;
                isEntityChanged = true;
              }

              if (updates.state !== undefined && !isEqual(newEntity.currentState, updates.state)) {
                newEntity.currentState = updates.state;
                isEntityChanged = true;
              }

              if (updates.attributes && updates.attributes.length > 0) {
                const updatedAttributes = [...(e.attributes || [])];
                let isAttributesChanged = false;

                for (const updatedAttr of updates.attributes) {
                  const index = updatedAttributes.findIndex(a => a.key === updatedAttr.key);
                  if (index >= 0) {
                    // Check primitive equality to avoid unnecessary arrays allocation
                    const oldNumValue = updatedAttributes[index].numValue;
                    const oldStrValue = updatedAttributes[index].strValue;
                    const oldCurrentValue = updatedAttributes[index].currentValue;

                    const newNumValue = typeof updatedAttr.value === 'number' ? updatedAttr.value : oldNumValue;
                    const newStrValue = typeof updatedAttr.value === 'string' ? updatedAttr.value : oldStrValue;

                    if (oldNumValue !== newNumValue || oldStrValue !== newStrValue || oldCurrentValue !== updatedAttr.value) {
                      updatedAttributes[index] = {
                        ...updatedAttributes[index],
                        currentValue: updatedAttr.value,
                        numValue: newNumValue,
                        strValue: newStrValue,
                      };
                      isAttributesChanged = true;
                    }
                  }
                  else {
                    updatedAttributes.push({
                      key: updatedAttr.key,
                      currentValue: updatedAttr.value,
                      numValue: typeof updatedAttr.value === 'number' ? updatedAttr.value : null,
                      strValue: typeof updatedAttr.value === 'string' ? updatedAttr.value : null,
                    } as any);
                    isAttributesChanged = true;
                  }
                }

                if (isAttributesChanged) {
                  newEntity.attributes = updatedAttributes;
                  isEntityChanged = true;
                }
              }

              if (isEntityChanged) {
                isDeviceEntitiesChanged = true;
                return newEntity;
              }
              return e; // Return old entity literal if practically no change
            });

            if (!isDeviceEntitiesChanged) {
              return d; // Completely abort device recreation
            }

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
