import { useCallback } from 'react';
import { showErrorMessage, showSuccessMessage } from '@/components/ui';
import { translate } from '@/lib/i18n';

export function useRoomActions() {
  const toggleRoomPower = useCallback(async (roomId: string, currentState: boolean) => {
    try {
      // NOTE: Replace with actual back-end call once available
      // e.g. await deviceService.controlRoomDevices(roomId, !currentState);
      console.log(`[Mock] Toggled room ${roomId} power to ${!currentState}`);

      // Mock toast
      showSuccessMessage(
        translate('base.success', { defaultValue: 'Success' }),
      );
    }
    catch (err: any) {
      showErrorMessage(err?.message || translate('base.error'));
    }
  }, []);

  const triggerFavoriteScene = useCallback(async (roomId: string) => {
    try {
      // NOTE: Replace with actual back-end call
      // e.g. await sceneService.triggerRoomFavoriteScene(roomId);
      console.log(`[Mock] Triggered favorite scene for room ${roomId}`);

      showSuccessMessage(
        translate('base.success', { defaultValue: 'Scene triggered' }),
      );
    }
    catch (err: any) {
      showErrorMessage(err?.message || translate('base.error'));
    }
  }, []);

  return {
    toggleRoomPower,
    triggerFavoriteScene,
  };
}
