import { client } from '../common';

// ============================================================
// ENUMS (AI_INSTRUCTIONS.md §3.2 — BẮT BUỘC dùng enum cho fixed values)
// ============================================================
export enum ESceneTriggerType {
  Schedule = 'SCHEDULE',
  DeviceState = 'DEVICE_STATE',
  Location = 'LOCATION',
}

export enum ESceneActionType {
  DeviceControl = 'DEVICE_CONTROL',
  Delay = 'DELAY',
  Notification = 'NOTIFICATION',
  RunScene = 'RUN_SCENE',
}

// ============================================================
// TYPES
// ============================================================
export type TSceneTrigger = {
  type: ESceneTriggerType;
  scheduleConfig?: {
    cron?: string;
    hour?: number;
    minute?: number;
    timezone?: string;
  };
  deviceStateConfig?: {
    deviceToken: string;
    entityCode: string;
    operator: string;
    value: unknown;
  };
};

export type TSceneAction = {
  type: ESceneActionType;
  deviceToken?: string;
  entityCode?: string;
  value?: unknown;
  delayMs?: number;
  sceneId?: string;
  notificationTitle?: string;
  notificationBody?: string;
};

export type TScene = {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  homeId: string;
  icon?: string | null;
  color?: string | null;
  roomId?: string | null;
  minIntervalSeconds?: number;
  triggers: TSceneTrigger[];
  actions: TSceneAction[];
  createdAt: string;
  updatedAt: string;
};

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
