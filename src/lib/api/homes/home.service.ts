import { client } from '../common';

// ============================================================
// TYPES
// ============================================================
export type Home = {
  id: string;
  name: string;
  ownerId: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
};

export type Floor = {
  id: string;
  name: string;
  homeId: string;
  sortOrder: number;
  rooms?: Room[];
};

export type Room = {
  id: string;
  name: string;
  homeId: string;
  floorId?: string;
};

// ============================================================
// API SERVICE
// ============================================================
export const homeService = {
  getHomes: async (): Promise<Home[]> => {
    const { data } = await client.get('/homes');
    return data.data || data;
  },

  getFloors: async (homeId: string): Promise<Floor[]> => {
    const { data } = await client.get(`/homes/${homeId}/floors`);
    return data.data || data;
  },

  getRooms: async (homeId: string): Promise<Room[]> => {
    const { data } = await client.get(`/homes/${homeId}/rooms`);
    return data.data || data;
  },
};
