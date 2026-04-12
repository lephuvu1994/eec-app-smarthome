import { client } from '../common';
import type { TScene, TSceneAction, TSceneTrigger } from '@/types/scene';
import { ESceneActionType, ESceneTriggerType } from '@/types/scene';

export type TCreateSceneDto = {
  name: string;
  homeId: string;
  icon?: string;
  color?: string;
  roomId?: string;
  triggers?: TSceneTrigger[];
  actions: TSceneAction[];
  minIntervalSeconds?: number;
};

export type TUpdateSceneDto = Partial<Omit<TCreateSceneDto, 'homeId'>>;

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

  createScene: async (dto: TCreateSceneDto): Promise<TScene> => {
    const { data } = await client.post('/scenes', dto);
    return data.data || data;
  },

  updateScene: async (sceneId: string, dto: TUpdateSceneDto): Promise<TScene> => {
    const { data } = await client.patch(`/scenes/${sceneId}`, dto);
    return data.data || data;
  },

  deleteScene: async (sceneId: string): Promise<void> => {
    await client.delete(`/scenes/${sceneId}`);
  },

  runScene: async (sceneId: string, delaySeconds?: number): Promise<TRunSceneResponse> => {
    const { data } = await client.post(`/scenes/${sceneId}/run`, delaySeconds !== undefined ? { delaySeconds } : {});
    return data.data || data;
  },

  reorderScenes: async (homeId: string, sceneIds: string[]): Promise<void> => {
    await client.patch('/scenes/reorder', { homeId, sceneIds });
  },
};
