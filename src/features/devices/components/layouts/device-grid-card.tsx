import type { TDeviceCardProps } from '../types';

import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { PulseDot } from '@/components/base/PulseDot';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { PowerIcon } from '@/components/ui/icons/power-icon';
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { ETheme } from '@/types/base';
import { ETypeViewDevice } from '@/types/device';

export function DeviceGridCard({
  displayName,
  deviceImage,
  isOnline,
  isSingleEntity,
  statusLabel,
  showExpandIcon,
  config,
  animatedGradientStyle,
  powerButtonStyle,
  onToggle,
  onPressCard,
  onPressExpand,
  viewType,
}: TDeviceCardProps) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const layout = useWindowDimensions();

  const columns = viewType === ETypeViewDevice.OneThirdWidth ? 3 : 2;
  const cardWidth = (layout.width - BASE_SPACE_HORIZONTAL * 2 - GAP_DEVICE_VIEW_MOBILE * (columns - 1)) / columns;

  return (
    <TouchableOpacity
      onPress={isOnline ? onPressCard : undefined}
      disabled={!isOnline}
      style={{ width: cardWidth }}
      className={`h-36 justify-between overflow-hidden rounded-xl border p-3 ${
        isOnline
          ? 'border-white bg-white shadow-sm dark:border-[#292929] dark:bg-[#FFFFFF0D]'
          : 'border-dashed border-neutral-300 bg-neutral-100/60 dark:border-neutral-600 dark:bg-[#1a1a1a]'
      }`}
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
        <Image
          source={deviceImage}
          style={{ width: 52, height: 52, opacity: isOnline ? 1 : 0.35 }}
          contentFit="cover"
        />
        {isSingleEntity && config.hasToggle && (
          <TouchableOpacity onPress={isOnline ? onToggle : undefined} disabled={!isOnline} activeOpacity={0.7}>
            <Animated.View
              style={[
                { width: 32, height: 32, borderRadius: 17, padding: 6 },
                isOnline
                  ? powerButtonStyle
                  : {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F5F5F5',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E0E0E0',
                    },
              ]}
            >
              <PowerIcon color={isOnline ? '#1B1B1B' : (isDark ? '#3a3a3a' : '#C8C8C8')} size={18} />
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
            ? <PulseDot color="#A3EC3E" size={5} />
            : <View className="size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />}
          <Text className={isOnline ? 'text-xs font-medium text-[#A3EC3E]' : 'text-xs text-neutral-400'}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {showExpandIcon && (
        <TouchableOpacity
          onPress={isOnline ? onPressExpand : undefined}
          disabled={!isOnline}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="absolute right-2 bottom-2 size-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
        >
          <FontAwesome6 name="chevron-up" size={12} color="#A3A3A3" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
