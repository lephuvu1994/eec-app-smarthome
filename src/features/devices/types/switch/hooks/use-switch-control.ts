import type { TDevice, TDeviceEntity } from '@/types/device';

import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService } from '@/lib/api/devices/device.service';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';

export function useSwitchControl(device: TDevice, entity: TDeviceEntity) {
  const allowHaptics = useConfigManager(state => state.allowHaptics);
  const updateDeviceEntity = useDeviceStore(state => state.updateDeviceEntity);

  const isOn = entity?.currentState === 1 || entity?.state === 1;
  const [isLoading, setIsLoading] = useState(false);

  // Sync state from WS
  useDeviceEvent(device?.id || '', useCallback((data: { entityCode?: string; state?: any; value?: any }) => {
    if (data.entityCode === entity?.code && device?.id && entity?.code) {
      const val = data.state ?? data.value;
      const parsedState = (val === 1 || val === '1') ? 1 : 0;
      updateDeviceEntity(device.id, entity.code, { state: parsedState });
    }
  }, [entity?.code, device?.id, updateDeviceEntity]));

  const handleToggle = async () => {
    if (isLoading || !device?.id || !entity?.code)
      return;
    const nextState = !isOn;

    if (allowHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Optimistically update global store immediately
    const previousState = isOn ? 1 : 0;
    updateDeviceEntity(device.id, entity.code, { state: nextState ? 1 : 0 });

    setIsLoading(true);

    try {
      await deviceService.setEntityValue(device.token, entity.code, nextState ? 1 : 0);
    }
    catch (e) {
      console.log('Failed to toggle switch entity:', e);
      // Rollback on failure
      updateDeviceEntity(device.id, entity.code, { state: previousState });
      if (allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  return {
    isOn,
    isLoading,
    handleToggle,
  };
}
