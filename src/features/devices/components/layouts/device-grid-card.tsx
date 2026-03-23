import type { TDeviceCardProps } from '../types';

import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';

import { PulseDot } from '@/components/base/PulseDot';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { PowerIcon } from '@/components/ui/icons/power-icon';
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE, GRID_VIEW_DEVICE_MOBILE } from '@/constants';

export function DeviceGridCard({
  displayName,
  deviceImage,
  isOnline,
  isSingleFeature,
  statusLabel,
  showExpandIcon,
  config,
  animatedGradientStyle,
  powerButtonStyle,
  onToggle,
  onPressCard,
  onPressExpand,
}: TDeviceCardProps) {
  const layout = useWindowDimensions();
  const cardWidth = (layout.width - BASE_SPACE_HORIZONTAL * 2 - GAP_DEVICE_VIEW_MOBILE) / GRID_VIEW_DEVICE_MOBILE;

  return (
    <TouchableOpacity
      onPress={onPressCard}
      style={{ width: cardWidth }}
      className="h-36 justify-between overflow-hidden rounded-xl border border-white bg-white p-3 shadow-sm dark:border-[#292929] dark:bg-[#FFFFFF0D]"
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedGradientStyle]} pointerEvents="none">
        <LinearGradient
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          colors={[`${config.accentColor}26`, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View className="w-full flex-row items-start justify-between" pointerEvents="box-none">
        <Image source={deviceImage} style={{ width: 52, height: 52 }} contentFit="cover" />
        {isSingleFeature && config.hasToggle && (
          <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
            <Animated.View style={[{ width: 32, height: 32, borderRadius: 17, padding: 7 }, powerButtonStyle]}>
              <PowerIcon color="#1B1B1B" size={18} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      <View pointerEvents="none">
        <Text className="text-[15px] font-bold text-neutral-800 dark:text-white" numberOfLines={1}>
          {displayName}
        </Text>
        <View className="flex-row items-center gap-1">
          {isOnline
            ? <PulseDot color={config.accentColor} size={5} />
            : <View className="size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />}
          <Text className={isOnline ? 'text-xs font-medium text-[#A3EC3E]' : 'text-xs text-neutral-400'}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {showExpandIcon && (
        <TouchableOpacity
          onPress={onPressExpand}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="absolute right-2 bottom-2 size-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
        >
          <FontAwesome6 name="chevron-up" size={12} color="#A3A3A3" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
