import type { TDeviceSchedule } from '@/lib/api/automation/automation.service';
import type { TDeviceEntity } from '@/lib/api/devices/device.service';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorMessage, showSuccessMessage } from '@/components/ui';
import { useCreateSchedule, useDeleteSchedule } from '@/lib/api/automation/automation.query';
import { EAutomationTargetType } from '@/lib/api/automation/automation.service';
import { translate } from '@/lib/i18n';

type UseScheduleEditorProps = {
  entity: TDeviceEntity;
  existingSchedule?: TDeviceSchedule | null;
  onSuccess?: () => void;
};

export function useScheduleEditor({ entity, existingSchedule, onSuccess }: UseScheduleEditorProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: createScheduleMutation, isPending: isSavingSchedule } = useCreateSchedule({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useCreateSchedule.getKey() });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      showSuccessMessage(translate('automation.schedule.created'));
      onSuccess?.();
    },
    onError: () => {
      showErrorMessage(translate('base.somethingWentWrong'));
    },
  });

  const { mutateAsync: deleteScheduleMutation, isPending: isDeletingSchedule } = useDeleteSchedule({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useDeleteSchedule.getKey() });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      showSuccessMessage(translate('automation.schedule.deleted'));
      onSuccess?.();
    },
    onError: () => {
      showErrorMessage(translate('base.somethingWentWrong'));
    },
  });

  const saveSchedule = async (time: Date, selectedDays: number[], targetValue: 1 | 0 | 'OPEN' | 'CLOSE' | 'STOP') => {
    if (!entity)
      throw new Error('No entity selected');

    if (existingSchedule?.id) {
      await deleteScheduleMutation(existingSchedule.id);
    }

    const timeOfDay = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return createScheduleMutation({
      name: `${translate('automation.schedule.scheduleFor')} ${entity.name || entity.code}`,
      targetType: EAutomationTargetType.DEVICE_ENTITY,
      targetId: entity.id,
      service: 'device-control',
      actions: [{ value: targetValue }],
      daysOfWeek: selectedDays,
      timeOfDay,
      timezone: tz,
    });
  };

  const deleteSchedule = async (id: string) => {
    return deleteScheduleMutation(id);
  };

  return {
    saveSchedule,
    deleteSchedule,
    isSaving: isSavingSchedule,
    isDeleting: isDeletingSchedule,
    isBusy: isSavingSchedule || isDeletingSchedule,
  };
}
