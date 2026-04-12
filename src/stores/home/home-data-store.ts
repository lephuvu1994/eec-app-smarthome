import { TFloor, TRoom } from '@/types/home';

import { create } from 'zustand';

import { createJSONStorage, persist } from 'zustand/middleware';

import { homeService } from '@/lib/api/homes/home.service';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================
type THomeDataState = {
  floors: TFloor[];
  rooms: TRoom[];
  isLoading: boolean;

  // ─── Sync ──────────────────────────
  /** Đồng bộ floors + rooms từ API cho homeId */
  syncFromAPI: (homeId: string) => Promise<void>;
  /** Populate trực tiếp từ data đã fetch (từ getHomes) */
  populateFromHome: (floors: TFloor[], rooms: TRoom[]) => void;
  clear: () => void;

  // ─── Floors ────────────────────────
  addFloor: (floor: TFloor) => void;
  updateFloor: (id: string, data: Partial<TFloor>) => void;
  removeFloor: (id: string) => void;
  setFloors: (floors: TFloor[]) => void;

  // ─── Rooms ─────────────────────────
  addRoom: (room: TRoom) => void;
  updateRoom: (id: string, data: Partial<TRoom>) => void;
  removeRoom: (id: string) => void;
  setRooms: (rooms: TRoom[]) => void;
};

// ============================================================
// STORE
// ============================================================
const _useHomeDataStore = create<THomeDataState>()(
  persist(
    set => ({
      floors: [],
      rooms: [],
      isLoading: false,

      // ─── Sync ──────────────────────────
      syncFromAPI: async (homeId: string) => {
        // Do not block UI with isLoading here to preserve hydration zero-latency UX
        try {
          const detail = await homeService.getHomeDetail(homeId);
          set({
            floors: detail.floors,
            rooms: detail.rooms,
          });
        }
        catch {
          // Silent catch to prevent UI interruption
        }
      },

      populateFromHome: (floors, rooms) => {
        set({ floors, rooms });
      },

      clear: () => {
        set({ floors: [], rooms: [], isLoading: false });
      },

      // ─── Floors ────────────────────────
      addFloor: (floor) => {
        set(s => ({ floors: [...s.floors, floor] }));
      },

      updateFloor: (id, data) => {
        set(s => ({
          floors: s.floors.map(f => (f.id === id ? { ...f, ...data } : f)),
        }));
      },

      removeFloor: (id) => {
        set(s => ({
          floors: s.floors.filter(f => f.id !== id),
          // Rooms thuộc floor → set floorId = undefined (ungrouped)
          rooms: s.rooms.map(r =>
            r.floorId === id ? { ...r, floorId: undefined } : r,
          ),
        }));
      },

      setFloors: (floors) => {
        set({ floors });
      },

      // ─── Rooms ─────────────────────────
      addRoom: (room) => {
        set(s => ({ rooms: [...s.rooms, room] }));
      },

      updateRoom: (id, data) => {
        set(s => ({
          rooms: s.rooms.map(r => (r.id === id ? { ...r, ...data } : r)),
        }));
      },

      removeRoom: (id) => {
        set(s => ({
          rooms: s.rooms.filter(r => r.id !== id),
        }));
      },

      setRooms: (rooms) => {
        set({ rooms });
      },
    }),
    {
      name: 'home-data-storage', // Tên unique cho MMKV key
      storage: createJSONStorage(() => mmkvStorage),
      // Bỏ qua isLoading khỏi cache list để tránh loop lock loading state
      partialize: state => ({ floors: state.floors, rooms: state.rooms }),
    },
  ),
);

export const useHomeDataStore = createSelectors(_useHomeDataStore);
