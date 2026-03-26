import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService } from '@/lib/api/devices/device.service';
import { useConfigManager } from '@/stores/config/config';

export function useSwitchControl(device: TDevice, entity: TDeviceEntity) {
  const allowHaptics = useConfigManager(state => state.allowHaptics);
  const serverIsOn = entity?.currentState === 1 || entity?.state === 1;
  const [isOn, setIsOn] = useState(serverIsOn);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state from WS
  useDeviceEvent(device?.id || '', useCallback((data: { entityCode?: string; state?: any; value?: any }) => {
    if (data.entityCode === entity?.code) {
      const val = data.state ?? data.value;
      setIsOn(val === 1 || val === '1');
    }
  }, [entity?.code]));

  const handleToggle = async () => {
    if (isLoading)
      return;
    const nextState = !isOn;

    if (allowHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsOn(nextState);
    setIsLoading(true);

    try {
      if (entity.code) {
        await deviceService.setEntityValue(device.token, entity.code, nextState ? 1 : 0);
      }
    }
    catch (e) {
      console.log('Failed to toggle switch entity:', e);
      setIsOn(!nextState);
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
