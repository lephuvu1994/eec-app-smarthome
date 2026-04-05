import type { TDeviceEntity } from '@/lib/api/devices/device.service';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorMessage } from '@/components/ui';
import { useSchedules as baseUseSchedules, useToggleSchedule } from '@/lib/api/automation/automation.query';
import { EAutomationTargetType } from '@/lib/api/automation/automation.service';
import { translate } from '@/lib/i18n';

export function useSchedules(entity?: TDeviceEntity | null) {
  const queryClient = useQueryClient();
  const { data: allSchedules, isLoading, refetch } = baseUseSchedules();

  const schedules = allSchedules?.filter(
    s => s.targetType === EAutomationTargetType.DEVICE_ENTITY && s.targetId === entity?.id,
  ) || [];

  const { mutateAsync: toggleScheduleMutation } = useToggleSchedule({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: baseUseSchedules.getKey() });
    },
    onError: () => {
      showErrorMessage(translate('base.somethingWentWrong'));
    },
  });

  const toggleSchedule = async (id: string, isActive: boolean) => {
    // Optimistic update
    queryClient.setQueryData(baseUseSchedules.getKey(), (old: any) => {
      if (!old)
        return old;
      return old.map((s: any) => s.id === id ? { ...s, isActive } : s);
    });

    try {
      await toggleScheduleMutation({ id, isActive });
    }
    catch {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: baseUseSchedules.getKey() });
    }
  };

  return {
    schedules,
    isLoadingSchedules: isLoading,
    refetchSchedules: refetch,
    toggleSchedule,
  };
}
