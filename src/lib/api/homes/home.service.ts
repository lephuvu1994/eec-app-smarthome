import { client } from '../common';

// ============================================================
// TYPES
// ============================================================
export type THome = {
  id: string;
  name: string;
  ownerId: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
};

export type TFloor = {
  id: string;
  name: string;
  homeId: string;
  sortOrder: number;
  rooms?: TRoom[];
};

export type TRoom = {
  id: string;
  name: string;
  homeId: string;
  floorId?: string;
};

export type TCreateRoomBody = {
  name: string;
  floorId?: string;
};

export type TUpdateRoomBody = {
  name?: string;
};

export type TCreateFloorBody = {
  name: string;
  sortOrder?: number;
};

export type TUpdateFloorBody = {
  name?: string;
  sortOrder?: number;
};

// ============================================================
// API SERVICE
// ============================================================
export const homeService = {
  // ─── Home ───────────────────────────
  getHomes: async (): Promise<THome[]> => {
    const { data } = await client.get('/homes');
    return data.data || data;
  },

  // ─── Floor ──────────────────────────
  getFloors: async (homeId: string): Promise<TFloor[]> => {
    const { data } = await client.get(`/homes/${homeId}/floors`);
    return data.data || data;
  },

  createFloor: async (homeId: string, body: TCreateFloorBody): Promise<TFloor> => {
    const { data } = await client.post(`/homes/${homeId}/floors`, body);
    return data.data || data;
  },

  updateFloor: async (floorId: string, body: TUpdateFloorBody): Promise<TFloor> => {
    const { data } = await client.patch(`/homes/floors/${floorId}`, body);
    return data.data || data;
  },

  deleteFloor: async (homeId: string, floorId: string): Promise<void> => {
    await client.delete(`/homes/${homeId}/floors/${floorId}`);
  },

  // ─── Room ──────────────────────────
  getRooms: async (homeId: string): Promise<TRoom[]> => {
    const { data } = await client.get(`/homes/${homeId}/rooms`);
    return data.data || data;
  },

  createRoom: async (homeId: string, body: TCreateRoomBody): Promise<TRoom> => {
    const { data } = await client.post(`/homes/${homeId}/rooms`, body);
    return data.data || data;
  },

  updateRoom: async (roomId: string, body: TUpdateRoomBody): Promise<TRoom> => {
    const { data } = await client.patch(`/homes/rooms/${roomId}`, body);
    return data.data || data;
  },

  deleteRoom: async (homeId: string, roomId: string): Promise<void> => {
    await client.delete(`/homes/${homeId}/rooms/${roomId}`);
  },
};
