import type { TDevice, TDeviceEntity } from '@/types/device';

import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService } from '@/lib/api/devices/device.service';
import { useConfigManager } from '@/stores/config/config';

export function useClimateControl(device: TDevice, entity: TDeviceEntity) {
  const allowHaptics = useConfigManager(state => state.allowHaptics);

  const serverIsOn = entity?.currentState === 1 || entity?.state === 1;
  const serverTargetTemp = entity?.attributes?.find(attr => attr.key === 'temperature')?.currentValue || 24;
  const serverCurrentTemp = entity?.attributes?.find(attr => attr.key === 'current_temperature')?.currentValue || 24;
  const serverMode = entity?.attributes?.find(attr => attr.key === 'mode')?.currentValue || 'cool';

  const [isOn, setIsOn] = useState(serverIsOn);
  const [targetTemp, setTargetTemp] = useState<number>(Number(serverTargetTemp));
  const [currentTemp, setCurrentTemp] = useState<number>(Number(serverCurrentTemp));
  const [mode, setMode] = useState<string>(String(serverMode));
  const [isLoading, setIsLoading] = useState(false);

  // Sync state from WS
  useDeviceEvent(device?.id || '', useCallback((data: { entityCode?: string; state?: any; value?: any; attributes?: Record<string, any> }) => {
    if (data.entityCode === entity?.code) {
      const val = data.state ?? data.value;
      if (val !== undefined && val !== null) {
        setIsOn(val === 1 || val === '1');
      }
      if (data.attributes) {
        if (data.attributes.temperature !== undefined)
          setTargetTemp(Number(data.attributes.temperature));
        if (data.attributes.current_temperature !== undefined)
          setCurrentTemp(Number(data.attributes.current_temperature));
        if (data.attributes.mode !== undefined)
          setMode(String(data.attributes.mode));
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
      console.log('Failed to toggle climate entity:', e);
      setIsOn(!nextState);
      if (allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleSetTemperature = async (newTemp: number) => {
    if (newTemp < 16 || newTemp > 30)
      return; // Standard AC limits

    if (allowHaptics) {
      Haptics.selectionAsync();
    }
    setTargetTemp(newTemp);

    try {
      if (!isOn) {
        setIsOn(true); // Auto turn on if changing temp while off
      }
      // TODO: Replace with actual device control implementation when attributes are fully supported by setEntityValue
      console.log(`Setting temperature to ${newTemp} for ${entity.code}`);
    }
    catch (e) {
      console.log('Failed to set temperature:', e);
    }
  };

  const handleIncreaseTemp = () => handleSetTemperature(targetTemp + 1);
  const handleDecreaseTemp = () => handleSetTemperature(targetTemp - 1);

  return {
    isOn,
    isLoading,
    targetTemp,
    currentTemp,
    mode,
    handleToggle,
    handleIncreaseTemp,
    handleDecreaseTemp,
    handleSetTemperature,
  };
}
