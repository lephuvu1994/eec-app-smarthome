import { client } from '../common';

// ============================================================
// ENUMS
// ============================================================
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

export type TCreateTimerPayload = {
  name?: string;
  targetType: EAutomationTargetType;
  targetId: string;
  service: string;
  executeAt: string;
  actions: TAutomationAction[];
};

export type TCreateSchedulePayload = {
  name: string;
  targetType: EAutomationTargetType;
  targetId: string;
  service: string;
  actions: TAutomationAction[];
  daysOfWeek?: number[];
  timeOfDay?: string;
  timezone?: string;
  cronExpression?: string;
};

// ============================================================
// SERVICE
// ============================================================
export const automationService = {
  // ── Timers ──────────────────────────────────────────────
  createTimer: async (payload: TCreateTimerPayload): Promise<TDeviceTimer> => {
    const { data } = await client.post('/automation/timers', payload);
    return data.data || data;
  },

  getTimers: async (): Promise<TDeviceTimer[]> => {
    const { data } = await client.get('/automation/timers');
    return data.data || data;
  },

  deleteTimer: async (timerId: string): Promise<void> => {
    await client.delete(`/automation/timers/${timerId}`);
  },

  // ── Schedules ────────────────────────────────────────────
  createSchedule: async (payload: TCreateSchedulePayload): Promise<TDeviceSchedule> => {
    const { data } = await client.post('/automation/schedules', payload);
    return data.data || data;
  },

  getSchedules: async (): Promise<TDeviceSchedule[]> => {
    const { data } = await client.get('/automation/schedules');
    return data.data || data;
  },

  deleteSchedule: async (scheduleId: string): Promise<void> => {
    await client.delete(`/automation/schedules/${scheduleId}`);
  },

  toggleSchedule: async (scheduleId: string, isActive: boolean): Promise<TDeviceSchedule> => {
    const { data } = await client.patch(`/automation/schedules/${scheduleId}/toggle`, { isActive });
    return data.data || data;
  },
};
