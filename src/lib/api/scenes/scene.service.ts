import { client } from '../common';

// ============================================================
// TYPES
// ============================================================
export type TScene = {
  id: string;
  name: string;
  active: boolean;
  homeId: string;
  triggers: any[];
  actions: any[];
  roomId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TRunSceneResponse = {
  jobId: string;
  message: string;
};

// ============================================================
// API SERVICE
// ============================================================
export const sceneService = {
  getScenes: async (homeId: string): Promise<TScene[]> => {
    const { data } = await client.get('/scenes', { params: { homeId } });
    return data.data || data;
  },

  getScene: async (sceneId: string): Promise<TScene> => {
    const { data } = await client.get(`/scenes/${sceneId}`);
    return data.data || data;
  },

  runScene: async (sceneId: string): Promise<TRunSceneResponse> => {
    const { data } = await client.post(`/scenes/${sceneId}/run`);
    return data.data || data;
  },
};
