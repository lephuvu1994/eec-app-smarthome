import type { TDeviceCardProps } from '../types';

import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { PulseDot } from '@/components/base/PulseDot';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { PowerIcon } from '@/components/ui/icons/power-icon';
import { translate } from '@/lib/i18n';

export function DeviceFullCard({
  displayName,
  deviceImage,
  isOnline,
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
}: TDeviceCardProps) {
  return (
    <TouchableOpacity
      onPress={onPressCard}
      className="h-36 w-full justify-between overflow-hidden rounded-xl border border-white bg-white p-3 shadow-sm dark:border-[#292929] dark:bg-[#FFFFFF0D]"
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedGradientStyle]} pointerEvents="none">
        <LinearGradient
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          colors={[`${config.accentColor}26`, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View className="w-full flex-row justify-between" pointerEvents="box-none">
        <View className="flex-1 flex-row gap-3">
          <Image source={deviceImage} style={{ width: 48, height: 48, borderRadius: 12 }} contentFit="cover" />
          <View className="justify-center">
            <Text className="text-base font-bold text-neutral-800 dark:text-white" numberOfLines={1}>
              {displayName}
            </Text>
            <View className="flex-row items-center gap-1.5">
              {isOnline
                ? <PulseDot color="#A3EC3E" size={6} />
                : <View className="size-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />}
              <Text className={isOnline ? 'text-xs font-medium text-[#A3EC3E]' : 'text-xs text-neutral-400'}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        {isSingleEntity && config.hasToggle && (
          <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
            <Animated.View style={[{ width: 32, height: 32, borderRadius: 17, padding: 7 }, powerButtonStyle]}>
              <PowerIcon color="#1B1B1B" size={18} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* Feature count */}
      <View className="flex-row items-center justify-between" pointerEvents="none">
        <Text className="text-[11px] text-neutral-400">
          {entityCount}
          {' '}
          {translate('base.feature')}
        </Text>
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
