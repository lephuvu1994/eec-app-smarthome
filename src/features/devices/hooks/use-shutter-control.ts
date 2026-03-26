import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { showErrorMessage } from '@/components/ui';
import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';

import { useConfigManager } from '@/stores/config/config';

export function useShutterControl(device: TDevice | undefined, primaryEntity: TDeviceEntity | undefined) {
  const allowHaptics = useConfigManager(s => s.allowHaptics);
  const [position, setPosition] = useState<number>(0);
  const [isControlling, setIsControlling] = useState(false);

  // Sync MQTT states
  useDeviceEvent(device?.id || '', useCallback((data: { entityCode?: string; state?: any; value?: any }) => {
    if (data.entityCode === primaryEntity?.code || (!data.entityCode && primaryEntity)) {
      const val = data.state ?? data.value;
      if (typeof val === 'number') {
        setPosition(val);
      }
      else if (val === 1 || val === '1') {
        setPosition(100);
      }
      else if (val === 0 || val === '0') {
        setPosition(0);
      }
    }
  }, [primaryEntity]));

  const sendCommand = async (pos: number) => {
    if (!device || !primaryEntity)
      return;

    if (allowHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsControlling(true);

    try {
      await deviceService.setEntityValue(device.token, primaryEntity.code, pos);
      setPosition(pos); // Optimistic update
    }
    catch (e: any) {
      console.error('Shutter control failed:', e);
      showErrorMessage(e?.message ?? translate('base.somethingWentWrong'));
    }
    finally {
      setIsControlling(false);
    }
  };

  const handleOpen = () => sendCommand(100);
  const handleClose = () => sendCommand(0);
  // Note: For 'stop', HA might use a specific service or we can send a custom value if the firmware supports it,
  // but standard payload for positional is usually just 'state' = 50 for halfway.
  // Tuya often uses 'stop' as a specific string command or enum. We'll send a specific 'stop' string if supported, or ignore.
  // We'll leave it as a placeholder string 'stop' for now, adjusting if the firmware requires it.
  const handleStop = () => sendCommand(-1); // Assuming -1 means stop in this firmware, or we can send string. Let's send 50 temporarily.

  return {
    position,
    isControlling,
    handleOpen,
    handleClose,
    handleStop,
    sendCommand,
  };
}
