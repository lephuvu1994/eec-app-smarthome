import type { SharedValue } from 'react-native-reanimated';

import type { TCurtainDeviceType } from '../utils/shutter-constants';
import type { TxKeyPath } from '@/lib/i18n';
import type { EDeviceProtocol } from '@/types/device';
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
  const doorHoleWidth = useSharedValue(0);
  const fadeAnim = useSharedValue(1);
  const prevTypeIdRef = React.useRef(deviceType.id);

  // ★ Cross-fade when device type changes
  React.useEffect(() => {
    if (prevTypeIdRef.current !== deviceType.id) {
      prevTypeIdRef.current = deviceType.id;

      fadeAnim.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 300 }),
      );
    }
  }, [deviceType.id, fadeAnim]);

  const animatedDoorStyle = useAnimatedStyle(() => {
    // position: 0 (Closed, door covers hole) → 100 (Open, door slides away)
    let translateX = 0;
    let translateY = 0;

    const progress = position.value / 100;

    switch (deviceType.animationType) {
      case 'slide_vertical':
        // Cửa cuốn trượt lên trên
        translateY = doorHoleHeight.value > 0 ? -progress * doorHoleHeight.value : 0;
        break;
      case 'slide_horizontal':
        // Rèm kéo sang bên trái
        translateX = doorHoleWidth.value > 0 ? -progress * doorHoleWidth.value : 0;
        break;
      case 'roll':
        // Roll = Cuộn lên, ta thu dọc lại thay vì chỉ translateX/Y (tùy ý tưởng)
        // Hiện tại xử lý roll giống slide_vertical
        translateY = doorHoleHeight.value > 0 ? -progress * doorHoleHeight.value : 0;
        break;
      case 'fold':
        // Fold = Gập hai biên (tạm thời slide sang trái)
        translateX = doorHoleWidth.value > 0 ? -progress * doorHoleWidth.value : 0;
        break;
      default:
        translateY = doorHoleHeight.value > 0 ? -progress * doorHoleHeight.value : 0;
    }

    return {
      transform: [{ translateX }, { translateY }],
    };
  });

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return (
    <View className="aspect-10/9 w-full overflow-hidden">
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
          doorHoleWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View className="size-full" style={animatedDoorStyle}>
          <Image source={deviceType.doorImage} style={styles.shutterImage} contentFit="fill" />
        </Animated.View>
      </Animated.View>

      {/* 3. Status pill overlay — top right */}
      <View className="absolute top-3 right-3 flex-row items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 shadow-sm dark:bg-black/60">
        <View className="size-2 rounded-full" style={{ backgroundColor: stateColor }} />
        <Text className="text-xs font-semibold text-black uppercase dark:text-white">
          {translate(`deviceDetail.shutter.states.${doorState}` as TxKeyPath, { defaultValue: doorState })}
        </Text>
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
