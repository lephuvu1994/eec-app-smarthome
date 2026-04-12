// ============================================================
// ENUMS
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
