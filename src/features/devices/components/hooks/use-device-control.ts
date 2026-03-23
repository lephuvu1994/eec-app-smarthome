import type { TDeviceCardProps, TDeviceConfig } from '../types';
import type { useModal } from '@/components/ui/modal';
import type { TDevice, TDeviceFeature } from '@/lib/api/devices/device.service';

import * as Haptics from 'expo-haptics';
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
import { EDeviceStatus } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { getDependentFeatures } from '@/lib/utils/device-feature-helper';
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
  activeFeature: TDeviceFeature | undefined,
  options: TDeviceControlOptions,
): TDeviceCardProps {
  const { modal, config } = options;
  const allowHaptics = useConfigManager(state => state.allowHaptics);

  // ─── Online status ─────────────────────────────────
  const isOnline = device.status === EDeviceStatus.ONLINE;

  // ─── Power state (optimistic) ──────────────────────
  const primaryFeature = activeFeature || device.features?.[0];
  const serverIsOn = primaryFeature?.currentValue === 1 || primaryFeature?.currentValue === '1';
  const [isOn, setIsOn] = useState(serverIsOn);
  const lastClickRef = useRef(0);

  // ─── WebSocket sync ────────────────────────────────
  useDeviceEvent(device.id, useCallback((data: { featureId?: string; value: any }) => {
    if (data.featureId === primaryFeature?.id || !data.featureId) {
      setIsOn(data.value === 1 || data.value === '1');
    }
  }, [primaryFeature?.id]));

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
      ['#E9ECF4', config.accentColor],
    ),
    transform: [{ scale: withSpring(powerProgress.value === 1 ? 1.05 : 1) }],
  }));

  // ─── Derived data ──────────────────────────────────
  const featureCount = device.features?.length ?? 0;
  const isSingleFeature = featureCount <= 1;
  const hasMultipleFeatures = featureCount > 1;
  const hasDependentFeatures = activeFeature
    ? getDependentFeatures(device, activeFeature.id).length > 0
    : false;
  const showExpandIcon = (!activeFeature && hasMultipleFeatures) || hasDependentFeatures;

  const deviceImage = getDeviceImage(
    activeFeature?.category || device.type || device.features?.[0]?.category || 'camera',
  );
  const displayName = activeFeature
    ? `${device.name} - ${activeFeature.name || activeFeature.code}`
    : device.name;
  const statusLabel = isOnline ? translate('base.online') : translate('base.offline');

  // ─── Handlers ──────────────────────────────────────
  const onToggle = async () => {
    if (!config.hasToggle) return;

    const now = Date.now();
    if (now - lastClickRef.current < 500) return;
    lastClickRef.current = now;

    const nextState = !isOn;
    if (allowHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsOn(nextState);

    try {
      // TODO: Send toggle command via SocketManager
    } catch {
      setIsOn(!nextState);
      if (allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const onPressCard = () => {
    if (!activeFeature) {
      modal.present();
    } else {
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
    isSingleFeature,
    statusLabel,
    featureCount,
    showExpandIcon,
    config,
    animatedGradientStyle,
    powerButtonStyle,
    onToggle,
    onPressCard,
    onPressExpand,
  };
}
