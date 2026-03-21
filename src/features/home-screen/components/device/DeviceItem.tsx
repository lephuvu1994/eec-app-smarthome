import type { TDevice, TDeviceFeature } from '@/lib/api/devices/device.service';

import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE, GRID_VIEW_DEVICE_MOBILE } from '@/constants';
import { EDeviceStatus } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { ETypeViewDevice } from '@/types/device';
import { getDeviceImage } from '../../utils/device-image';

type TProps = {
  device: TDevice;
  typeViewDevice: ETypeViewDevice;
  activeFeature?: TDeviceFeature;
  onExpand?: (device: TDevice) => void;
};

export const DeviceItem: React.FC<TProps> = ({ device, typeViewDevice, activeFeature, onExpand }) => {
  const layout = useWindowDimensions();
  const isOnline = device.status === EDeviceStatus.ONLINE;
  const hasMultipleFeatures = (device.features?.length ?? 0) > 1;
  const deviceImage = getDeviceImage(activeFeature?.category || device.type || device.features?.[0]?.category || 'camera');
  const statusLabel = isOnline ? translate('base.online') : translate('base.offline');

  // Animation: online = 1, offline = 0
  const progress = useDerivedValue(() => {
    return withTiming(isOnline ? 1 : 0, { duration: 300 });
  });

  const animatedGradientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const displayName = activeFeature ? `${device.name} - ${activeFeature.name || activeFeature.code}` : device.name;

  // ─── FullWidth Layout ────────────────────────────
  if (typeViewDevice === ETypeViewDevice.FullWidth) {
    return (
      <View className="h-28 w-full justify-between overflow-hidden rounded-xl border border-white bg-white p-3 shadow-sm dark:border-[#292929] dark:bg-[#FFFFFF0D]">
        <Animated.View style={[StyleSheet.absoluteFill, animatedGradientStyle]}>
          <LinearGradient
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            colors={['rgba(163, 236, 62, 0.15)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View className="w-full flex-row justify-between">
          <View className="flex-1 flex-row gap-3">
            <Image source={deviceImage} style={{ width: 48, height: 48, borderRadius: 12 }} contentFit="cover" />
            <View className="justify-center">
              <Text className="text-base font-bold text-neutral-800 dark:text-white" numberOfLines={1}>
                {displayName}
              </Text>
              <Text className={isOnline ? 'text-xs font-medium text-[#A3EC3E]' : 'text-xs text-neutral-400'}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Online indicator dot */}
          <View className={`h-3 w-3 rounded-full ${isOnline ? 'bg-[#A3EC3E]' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
        </View>

        {/* Feature count */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] text-neutral-400">
            {device.features?.length ?? 0}
            {' '}
            {translate('base.feature')}
          </Text>
        </View>

        {hasMultipleFeatures && (
          <TouchableOpacity
            onPress={() => onExpand?.(device)}
            className="absolute right-2 bottom-2 h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <FontAwesome6 name="grip" size={12} color="#A3A3A3" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ─── Grid Layout ─────────────────────────────────
  return (
    <View
      style={{ width: (layout.width - BASE_SPACE_HORIZONTAL * 2 - GAP_DEVICE_VIEW_MOBILE) / GRID_VIEW_DEVICE_MOBILE }}
      className="h-36 justify-between overflow-hidden rounded-xl border border-white bg-white p-3 shadow-sm dark:border-[#292929] dark:bg-[#FFFFFF0D]"
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedGradientStyle]}>
        <LinearGradient
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          colors={['rgba(163, 236, 62, 0.15)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View className="w-full flex-row items-start justify-between">
        <Image source={deviceImage} style={{ width: 52, height: 52 }} contentFit="cover" />
        {/* Online indicator dot */}
        <View className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-[#A3EC3E]' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
      </View>

      <View>
        <Text className="text-[15px] font-bold text-neutral-800 dark:text-white" numberOfLines={1}>
          {displayName}
        </Text>
        <Text className={isOnline ? 'text-xs font-medium text-[#A3EC3E]' : 'text-xs text-neutral-400'}>
          {statusLabel}
        </Text>
      </View>

      {hasMultipleFeatures && (
        <TouchableOpacity
          onPress={() => onExpand?.(device)}
          className="absolute right-2 bottom-2 h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
        >
          <FontAwesome6 name="grip" size={12} color="#A3A3A3" />
        </TouchableOpacity>
      )}
    </View>
  );
};
