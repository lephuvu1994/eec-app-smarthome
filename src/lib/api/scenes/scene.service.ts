import { client } from '../common';

// ============================================================
// TYPES
// ============================================================
export type Scene = {
  id: string;
  name: string;
  active: boolean;
  homeId: string;
  triggers: any[];
  actions: any[];
  createdAt: string;
  updatedAt: string;
};

export type RunSceneResponse = {
  jobId: string;
  message: string;
};

// ============================================================
// API SERVICE
// ============================================================
export const sceneService = {
  getScenes: async (homeId: string): Promise<Scene[]> => {
    const { data } = await client.get('/scenes', { params: { homeId } });
    return data.data || data;
  },

  getScene: async (sceneId: string): Promise<Scene> => {
    const { data } = await client.get(`/scenes/${sceneId}`);
    return data.data || data;
  },

  runScene: async (sceneId: string): Promise<RunSceneResponse> => {
    const { data } = await client.post(`/scenes/${sceneId}/run`);
    return data.data || data;
  },
};
