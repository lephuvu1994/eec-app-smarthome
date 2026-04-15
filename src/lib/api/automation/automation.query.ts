import type {
  TCreateSchedulePayload,
  TCreateTimerPayload,
  TDeviceSchedule,
  TDeviceTimer,
} from '@/types/automation';
import { createMutation, createQuery } from 'react-query-kit';
import { automationService } from './automation.service';

/**
 * =======================
 * QUERIES
 * =======================
 */

export const useTimers = createQuery<TDeviceTimer[], void, Error>({
  queryKey: ['timers'],
  fetcher: () => automationService.getTimers(),
});

export const useSchedules = createQuery<TDeviceSchedule[], void, Error>({
  queryKey: ['schedules'],
  fetcher: () => automationService.getSchedules(),
});

/**
 * =======================
 * MUTATIONS
 * =======================
 */

export const useCreateTimer = createMutation<TDeviceTimer, TCreateTimerPayload, Error>({
  mutationFn: variables => automationService.createTimer(variables),
});

export const useDeleteTimer = createMutation<void, string, Error>({
  mutationFn: id => automationService.deleteTimer(id),
});

export const useCreateSchedule = createMutation<TDeviceSchedule, TCreateSchedulePayload, Error>({
  mutationFn: variables => automationService.createSchedule(variables),
});

export const useDeleteSchedule = createMutation<void, string, Error>({
  mutationFn: id => automationService.deleteSchedule(id),
});

export const useToggleSchedule = createMutation<TDeviceSchedule, { id: string; isActive: boolean }, Error>({
  mutationFn: ({ id, isActive }) => automationService.toggleSchedule(id, isActive),
});
