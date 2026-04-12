import type { DimensionValue } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { EDeviceProtocol } from '@/types/device';
import type { TCurtainDeviceType } from '../utils/shutter-constants';
import { Image } from 'expo-image';
import * as React from 'react';
import { StyleSheet } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text, View } from '@/components/ui';
import { NetworkSignalIndicator } from '@/features/devices/common/components/network-signal-indicator';
import { translate } from '@/lib/i18n';

type TProps = {
  /** Device type config from the registry */
  deviceType: TCurtainDeviceType;
  /** Door position 0 (closed) → 100 (open) */
  position: SharedValue<number>;
  doorState: string;
  stateColor: string;
  isOnline: boolean;
  protocol?: EDeviceProtocol;
  rssi?: number | null;
  linkquality?: number | null;
};

/**
 * ShutterVisualizer — Renders the curtain door animation.
 *
 * Technique:
 * - Background layer (bgImage) is fixed, door overlay (doorImage) slides via translateY.
 * - "doorHole" container uses overflow:'hidden' to clip the door beyond the frame.
 * - translateY is computed in pixels (via onLayout) for Reanimated compatibility.
 * - Cross-fade animation on device type change for smooth transitions.
 */
export function ShutterVisualizer({
  deviceType,
  position,
  doorState,
  stateColor,
  isOnline,
  protocol,
  rssi,
  linkquality,
}: TProps) {
  const doorHoleHeight = useSharedValue(0);
  const fadeAnim = useSharedValue(1);
  const prevTypeId = React.useRef(deviceType.id);

  // ★ Cross-fade when device type changes
  React.useEffect(() => {
    if (prevTypeId.current !== deviceType.id) {
      prevTypeId.current = deviceType.id;
      // eslint-disable-next-line react-hooks/immutability
      fadeAnim.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 300 }),
      );
    }
  }, [deviceType.id, fadeAnim]);

  const animatedDoorStyle = useAnimatedStyle(() => {
    // position: 0 (Closed, door covers hole) → 100 (Open, door slides up)
    // translateY: 0 → -doorHoleHeight
    const translateY = doorHoleHeight.value > 0
      ? -(position.value / 100) * doorHoleHeight.value
      : 0;

    return {
      transform: [{ translateY }],
    };
  });

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return (
    <View className="aspect-4/3 w-full overflow-hidden">
      {/* 1. Background layer — house with empty door hole */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedFadeStyle]}>
        <Image source={deviceType.bgImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>

      {/* 2. Door hole — clip area matching the door frame on the background */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            overflow: 'hidden',
            top: deviceType.doorFrame.top,
            left: deviceType.doorFrame.left,
            width: deviceType.doorFrame.width,
            height: deviceType.doorFrame.height,
          },
          animatedFadeStyle,
        ]}
        onLayout={(e) => {
          doorHoleHeight.value = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View className="size-full" style={animatedDoorStyle}>
          <Image source={deviceType.doorImage} style={styles.shutterImage} contentFit="fill" />
        </Animated.View>
      </Animated.View>

      {/* 3. Status pill overlay — top right */}
      <View className="absolute top-3 right-3 flex-row items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 shadow-sm dark:bg-black/60">
        <View className="size-2 rounded-full" style={{ backgroundColor: stateColor }} />
        <Text className="text-xs font-semibold text-black uppercase dark:text-white">{doorState}</Text>
      </View>

      {/* 4. Online status pill — top left */}
      <View className="absolute top-3 left-3 flex-row items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 shadow-sm">
        {protocol && (
          <NetworkSignalIndicator
            protocol={protocol}
            rssi={rssi}
            linkquality={linkquality}
            size={12}
            isOnline={isOnline}
          />
        )}
        <Text
          className="text-xs font-semibold shadow-sm"
          style={{ color: isOnline ? '#A3E635' : '#EF4444' }}
        >
          {isOnline ? translate('base.online') : translate('base.offline')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shutterImage: {
    width: '100%',
    height: '100%',
  },
});
