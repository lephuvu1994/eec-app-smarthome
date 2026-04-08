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
  const serverColorTemp = entity?.attributes?.find(attr => attr.key === 'color_temp')?.currentValue || 4000;
  const serverColor = entity?.attributes?.find(attr => attr.key === 'color')?.currentValue || { h: 0, s: 0, b: 100 };

  const [isOn, setIsOn] = useState(serverIsOn);
  const [brightness, setBrightness] = useState<number>(Number(serverBrightness));
  const [colorTemp, setColorTemp] = useState<number>(Number(serverColorTemp));
  const [color, setColor] = useState<{ h: number; s: number; b: number }>(typeof serverColor === 'string' ? JSON.parse(serverColor) : serverColor);
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
      if (allowHaptics)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleChangeBrightness = async (value: number) => {
    setBrightness(value);
    try {
      if (!isOn && value > 0)
        setIsOn(true);
      await deviceService.setMultipleEntityValues(device.token, entity.code, { brightness: value });
    }
    catch (e) {
      console.log('Failed to set brightness:', e);
    }
  };

  const handleChangeColorTemp = async (value: number) => {
    setColorTemp(value);
    try {
      await deviceService.setMultipleEntityValues(device.token, entity.code, { color_temp: value });
    }
    catch (e) {
      console.log('Failed to set color_temp:', e);
    }
  };

  const handleChangeColor = async (value: { h: number; s: number; b: number }) => {
    setColor(value);
    try {
      await deviceService.setMultipleEntityValues(device.token, entity.code, { color: value });
    }
    catch (e) {
      console.log('Failed to set color:', e);
    }
  };

  return {
    isOn,
    isLoading,
    brightness,
    colorTemp,
    color,
    handleToggle,
    handleChangeBrightness,
    handleChangeColorTemp,
    handleChangeColor,
  };
}
