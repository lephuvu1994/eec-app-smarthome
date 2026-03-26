import type { TDeviceEntity } from '../devices/device.service';
import type { TScene } from '../scenes/scene.service';

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
  sortOrder: number;
  homeId: string;
  floorId?: string;
  entities?: TDeviceEntity[];
  scenes?: TScene[];
};

/** GET /homes trả về home kèm floors + rooms */
export type THomeWithFloors = THome & {
  floors: TFloor[];
  rooms: TRoom[];
};

/** GET /homes/:id/detail */
export type THomeDetail = {
  home: THome;
  floors: TFloor[];
  rooms: TRoom[];
};

export type TCreateRoomBody = {
  name: string;
  floorId?: string;
};

export type TUpdateRoomBody = {
  name?: string;
  floorId?: string | null;
};

export type TCreateFloorBody = {
  name: string;
  sortOrder?: number;
};

export type TUpdateFloorBody = {
  name?: string;
  sortOrder?: number;
};

export type TAssignRoomsBody = {
  roomIds: string[];
};

export type TAssignEntitiesBody = {
  entityIds: string[];
};

export type TAssignScenesBody = {
  sceneIds: string[];
};

// ============================================================
// API SERVICE
// ============================================================
export const homeService = {
  // ─── Home ───────────────────────────
  /** Lấy danh sách nhà (kèm floors + rooms nested) */
  getHomes: async (): Promise<THomeWithFloors[]> => {
    const { data } = await client.get('/homes');
    return data.data || data;
  },

  /** Chi tiết 1 nhà (home + floors + rooms) */
  getHomeDetail: async (homeId: string): Promise<THomeDetail> => {
    const { data } = await client.get(`/homes/${homeId}/detail`);
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

  deleteFloor: async (floorId: string): Promise<void> => {
    await client.delete(`/homes/floors/${floorId}`);
  },

  reorderFloors: async (homeId: string, ids: string[]): Promise<TFloor[]> => {
    const { data } = await client.patch(`/homes/${homeId}/floors/reorder`, { ids });
    return data.data || data;
  },

  assignRoomsToFloor: async (floorId: string, body: TAssignRoomsBody): Promise<TFloor> => {
    const { data } = await client.patch(`/homes/floors/${floorId}/rooms`, body);
    return data.data || data;
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

  deleteRoom: async (roomId: string): Promise<void> => {
    await client.delete(`/homes/rooms/${roomId}`);
  },

  reorderRooms: async (homeId: string, ids: string[]): Promise<TRoom[]> => {
    const { data } = await client.patch(`/homes/${homeId}/rooms/reorder`, { ids });
    return data.data || data;
  },

  assignEntitiesToRoom: async (roomId: string, body: { entityIds: string[] }): Promise<TRoom> => {
    const { data } = await client.patch(`/homes/rooms/${roomId}/entities`, body);
    return data.data || data;
  },

  assignScenesToRoom: async (roomId: string, body: { sceneIds: string[] }): Promise<TRoom> => {
    const { data } = await client.patch(`/homes/rooms/${roomId}/scenes`, body);
    return data.data || data;
  },
};
