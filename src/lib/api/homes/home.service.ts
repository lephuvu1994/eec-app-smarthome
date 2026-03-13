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

// ============================================================
// API SERVICE
// ============================================================
export const homeService = {
  getHomes: async (): Promise<THome[]> => {
    const { data } = await client.get('/homes');
    return data.data || data;
  },

  getFloors: async (homeId: string): Promise<TFloor[]> => {
    const { data } = await client.get(`/homes/${homeId}/floors`);
    return data.data || data;
  },

  getRooms: async (homeId: string): Promise<TRoom[]> => {
    const { data } = await client.get(`/homes/${homeId}/rooms`);
    return data.data || data;
  },
};
