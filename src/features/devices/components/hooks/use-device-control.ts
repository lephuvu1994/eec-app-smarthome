import type { TDeviceCardProps, TDeviceConfig } from '../types';
import type { useModal } from '@/components/ui/modal';
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
import { translate } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';

type TDeviceControlOptions = {
  modal: ReturnType<typeof useModal>;
  config: TDeviceConfig;
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
  const isSingleEntity = entityCount <= 1;
  const hasMultipleEntities = entityCount > 1;
  const hasAttributes = !!activeEntity?.attributes?.length;
  const showExpandIcon = (!activeEntity && hasMultipleEntities) || hasAttributes;

  const deviceImage = getDeviceImage(
    activeEntity?.domain || device.type || entities[0]?.domain || 'camera',
  );
  const displayName = activeEntity
    ? `${device.name} - ${activeEntity.name || activeEntity.code}`
    : device.name;
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
      if (primaryEntity?.code) {
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
      const targetEntityId = activeEntity?.id || primaryEntity?.id;
      router.push(`/device/${device.id}?entityId=${targetEntityId}`);
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
    isSingleEntity,
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
