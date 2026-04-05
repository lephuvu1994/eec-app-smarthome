import type { TDeviceEntity } from '@/lib/api/devices/device.service';
import { useTimers as baseUseTimers } from '@/lib/api/automation/automation.query';
import { EAutomationTargetType } from '@/lib/api/automation/automation.service';

export function useTimers(entity?: TDeviceEntity | null) {
  const { data: allTimers, isLoading, refetch } = baseUseTimers();

  const timers = allTimers?.filter(
    t => t.targetType === EAutomationTargetType.DEVICE_ENTITY && t.targetId === entity?.id,
  ) || [];

  return {
    timers,
    isLoadingTimers: isLoading,
    refetchTimers: refetch,
  };
}
