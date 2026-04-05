import type { TDeviceTimer } from '@/lib/api/automation/automation.service';
import type { TDeviceEntity } from '@/lib/api/devices/device.service';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorMessage, showSuccessMessage } from '@/components/ui';
import { useCreateTimer, useDeleteTimer } from '@/lib/api/automation/automation.query';
import { EAutomationTargetType } from '@/lib/api/automation/automation.service';
import { translate } from '@/lib/i18n';

type UseTimerEditorProps = {
  entity: TDeviceEntity;
  existingTimer?: TDeviceTimer | null;
  onSuccess?: () => void;
};

export function useTimerEditor({ entity, existingTimer, onSuccess }: UseTimerEditorProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: createTimerMutation, isPending: isSavingTimer } = useCreateTimer({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useCreateTimer.getKey() });
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      showSuccessMessage(translate('automation.countdown.timerSet'));
      onSuccess?.();
    },
    onError: () => {
      showErrorMessage(translate('base.somethingWentWrong'));
    },
  });

  const { mutateAsync: deleteTimerMutation, isPending: isDeletingTimer } = useDeleteTimer({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useDeleteTimer.getKey() });
      queryClient.invalidateQueries({ queryKey: ['timers'] });
      showSuccessMessage(translate('automation.countdown.deleted'));
      onSuccess?.();
    },
    onError: () => {
      showErrorMessage(translate('base.somethingWentWrong'));
    },
  });

  const saveTimer = async (totalSeconds: number, targetValue: 1 | 0 | 'OPEN' | 'CLOSE' | 'STOP') => {
    if (!entity)
      throw new Error('No entity selected');

    if (existingTimer?.id) {
      await deleteTimerMutation(existingTimer.id);
    }

    const executeAt = new Date(Date.now() + totalSeconds * 1000).toISOString();
    return createTimerMutation({
      name: `${translate('automation.countdown.timerFor')} ${entity.name || entity.code}`,
      targetType: EAutomationTargetType.DEVICE_ENTITY,
      targetId: entity.id,
      service: 'device-control',
      executeAt,
      actions: [{ value: targetValue }],
    });
  };

  const deleteTimer = async (id: string) => {
    return deleteTimerMutation(id);
  };

  return {
    saveTimer,
    deleteTimer,
    isSaving: isSavingTimer,
    isDeleting: isDeletingTimer,
    isBusy: isSavingTimer || isDeletingTimer,
  };
}
