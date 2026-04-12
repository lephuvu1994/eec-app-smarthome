export enum EAutomationTargetType {
  DEVICE_ENTITY = 'DEVICE_ENTITY',
  SCENE = 'SCENE',
}

export enum ETimerStatus {
  PENDING = 'PENDING',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ============================================================
// TYPES
// ============================================================

export type TAutomationAction = {
  value: number | string | boolean;
  delay?: number;
};

export type TDeviceTimer = {
  id: string;
  userId: string;
  name?: string;
  targetType: EAutomationTargetType;
  targetId: string;
  service: string;
  actions: TAutomationAction[];
  executeAt: string;
  jobId?: string;
  status?: ETimerStatus;
  createdAt: string;
};

export type TDeviceSchedule = {
  id: string;
  userId: string;
  name: string;
  targetType: EAutomationTargetType;
  targetId: string;
  service: string;
  actions: TAutomationAction[];
  cronExpression?: string;
  daysOfWeek: number[];
  timeOfDay?: string;
  timezone: string;
  isActive: boolean;
  nextExecuteAt?: string;
  createdAt: string;
};
