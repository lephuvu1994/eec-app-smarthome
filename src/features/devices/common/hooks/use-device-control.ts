import type { useModal } from '@/components/ui/modal';
import type { TDeviceCardProps, TDeviceConfig } from '@/features/devices/common/types';
import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useCallback, useRef, useState } from 'react';
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getDeviceImage } from '@/features/home-screen/utils/device-image';

import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService, EDeviceStatus, EEntityDomain } from '@/lib/api/devices/device.service';
import { bleCommandQueue, buildBleCmd } from '@/lib/ble-control';
import { translate } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';

type TDeviceControlOptions = {
  modal: ReturnType<typeof useModal>;
  config: TDeviceConfig;
  /** Map<deviceId, peripheralId> từ useBleNearby — undefined khi chưa có */
  availableBleDevices?: Map<string, string>;
};

/**
 * Shared logic for device control: toggle, WS sync, animations, handlers.
 * Returns TDeviceCardProps-compatible object for layout components.
 */
export function useDeviceControl(
  device: TDevice,
  activeEntity: TDeviceEntity | undefined,
  options: TDeviceControlOptions,
): Omit<TDeviceCardProps, 'viewType'> {
  const { modal, config } = options;
  const allowHaptics = useConfigManager(state => state.allowHaptics);
  const router = useRouter();

  // ─── Online status ─────────────────────────────────
  const isOnline = device.status === EDeviceStatus.ONLINE;

  // ─── Power state (optimistic) ──────────────────────
  const entities = device.entities ?? [];
  const primaryEntity = activeEntity || entities[0];
  const serverIsOn = primaryEntity?.currentState === 1 || primaryEntity?.currentState === '1'
    || primaryEntity?.state === 1;
  const [isOn, setIsOn] = useState(serverIsOn);
  const lastClickRef = useRef(0);

  // ─── MQTT sync ────────────────────────────────
  useDeviceEvent(device.id, useCallback((data: { entityCode?: string; state?: any; value?: any }) => {
    if (data.entityCode === primaryEntity?.code || !data.entityCode) {
      const val = data.state ?? data.value;
      setIsOn(val === 1 || val === '1');
    }
  }, [primaryEntity?.code]));

  // ─── Animations ────────────────────────────────────
  const powerProgress = useDerivedValue(() => {
    return withTiming(isOn ? 1 : 0, { duration: 300 });
  });

  const animatedGradientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(powerProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const powerButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      powerProgress.value,
      [0, 1],
      ['#E9ECF4', '#A3EC3E'],
    ),
    transform: [{ scale: withSpring(powerProgress.value === 1 ? 1.05 : 1) }],
  }));

  // ─── Derived data ──────────────────────────────────
  const entityCount = entities.length;
  // Natural hardware layout flag
  const isSingleHardwareEntity = entityCount <= 1;

  // Rules:
  // - Group Mode (no activeEntity): show Expand if multiple entities OR has attributes. Never QuickToggle.
  // - Flat Mode (has activeEntity): show QuickToggle. Show Expand ONLY if that specific entity has attributes.
  // - Naturally 1 button device: show QuickToggle. Show Expand ONLY if it has attributes.
  const hasAttributes = !!activeEntity?.attributes?.length || (!activeEntity && entities.some(e => e.attributes?.length > 0));

  const canQuickToggle = isSingleHardwareEntity || !!activeEntity;
  const showExpandIcon = (!activeEntity && !isSingleHardwareEntity) || !!activeEntity?.attributes?.length || (isSingleHardwareEntity && hasAttributes);

  const deviceImage = getDeviceImage(
    activeEntity?.domain || device.type || entities[0]?.domain || 'camera',
  );

  let displayName = device.name;
  if (activeEntity) {
    // If it's a Flat Mode split card (always has activeEntity)
    // We use hyphenated format to distinguish it as a specific entity card
    displayName = `${device.name} - ${activeEntity.name || activeEntity.code}`;
  }
  else if (isSingleHardwareEntity) {
    // Single entity hardware - group mode
    displayName = device.name || primaryEntity?.name;
  }

  const statusLabel = isOnline ? translate('base.online') : translate('base.offline');

  // ─── Handlers ──────────────────────────────────────
  const onToggle = async () => {
    if (!config.hasToggle)
      return;

    const now = Date.now();
    if (now - lastClickRef.current < 500)
      return;
    lastClickRef.current = now;

    const nextState = !isOn;
    if (allowHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsOn(nextState);

    try {
      // ── BLE fallback: device offline VÀ chip đang quảng cáo BLE nearby ──
      const peripheralId = options.availableBleDevices?.get(device.id);
      if (!isOnline && peripheralId && primaryEntity?.code) {
        const cmd = buildBleCmd(primaryEntity.code, nextState);
        await bleCommandQueue.enqueue(peripheralId, { cmd });
      }
      else if (primaryEntity?.code) {
        // ── MQTT path bình thường ──
        await deviceService.setEntityValue(device.token, primaryEntity.code, nextState ? 1 : 0);
      }
    }
    catch (e) {
      console.log('Failed to toggle entity:', e);
      setIsOn(!nextState);
      if (allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const onPressCard = () => {
    const domain = primaryEntity?.domain;
    if (
      domain === EEntityDomain.CURTAIN
      || domain === EEntityDomain.LIGHT
      || domain === EEntityDomain.SWITCH
      || domain === EEntityDomain.CLIMATE
    ) {
      const targetEntityParam = activeEntity ? `?entityId=${activeEntity.id}` : '';
      router.push(`/device/${device.id}${targetEntityParam}`);
      return;
    }

    if (!activeEntity) {
      modal.present();
    }
    else {
      onToggle();
    }
  };

  const onPressExpand = () => {
    modal.present();
  };

  return {
    device,
    displayName,
    deviceImage,
    isOnline,
    isOn,
    isSingleHardwareEntity,
    canQuickToggle,
    statusLabel,
    entityCount,
    showExpandIcon,
    config,
    animatedGradientStyle,
    powerButtonStyle,
    onToggle,
    onPressCard,
    onPressExpand,
  };
}
