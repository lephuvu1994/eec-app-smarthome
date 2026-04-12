import type { TDeviceTimelineResponse } from '@/types/device';
import type { TAssignRoomsBody, TCreateFloorBody, TCreateRoomBody, TFloor, THomeDetail, THomeWithFloors, TRoom, TUpdateFloorBody, TUpdateRoomBody } from '@/types/home';

import { client } from '../common';

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

  /** Lịch sử hoạt động toàn bộ thiết bị trong nhà */
  getHomeActivity: async (
    homeId: string,
    params?: { page?: number; limit?: number; type?: 'connection' | 'state' },
  ): Promise<TDeviceTimelineResponse> => {
    const { data } = await client.get(`/homes/${homeId}/activity`, { params });
    return data;
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
