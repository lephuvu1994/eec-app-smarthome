import { client } from '../common';

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
