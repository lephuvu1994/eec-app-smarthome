import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService } from '@/lib/api/devices/device.service';
import { useConfigManager } from '@/stores/config/config';

export function useLightControl(device: TDevice, entity: TDeviceEntity) {
  const allowHaptics = useConfigManager(state => state.allowHaptics);
  const serverIsOn = entity?.currentState === 1 || entity?.state === 1;
  const serverBrightness = entity?.attributes?.find(attr => attr.key === 'brightness')?.currentValue || 100;

  const [isOn, setIsOn] = useState(serverIsOn);
  const [brightness, setBrightness] = useState<number>(Number(serverBrightness));
  const [isLoading, setIsLoading] = useState(false);

  // Sync state from WS
  useDeviceEvent(device?.id || '', useCallback((data: { entityCode?: string; state?: any; value?: any }) => {
    if (data.entityCode === entity?.code) {
      const val = data.state ?? data.value;
      if (val !== undefined && val !== null) {
        setIsOn(val === 1 || val === '1');
      }
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
      console.log('Failed to toggle light entity:', e);
      setIsOn(!nextState);
      if (allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleChangeBrightness = async (value: number) => {
    setBrightness(value);
    // Ideally debounced or sent onChangeComplete if using a slider
    try {
      // Assuming setting brightness also turns the light on if it's off
      if (!isOn && value > 0) {
        setIsOn(true);
      }

      // We would need a specific API for brightness or send it as attribute.
      // For Tuya/HomeAssistant it's usually setting the value of a brightness entity or passing attributes to the main entity.
      // E.g: deviceService.setEntityValue(device.token, entity.code, value, { brightness: value });
      // Stub for now based on standard implementation:
      console.log(`Setting brightness to ${value} for ${entity.code}`);
    }
    catch (e) {
      console.log('Failed to set brightness:', e);
    }
  };

  return {
    isOn,
    isLoading,
    brightness,
    handleToggle,
    handleChangeBrightness,
  };
}
