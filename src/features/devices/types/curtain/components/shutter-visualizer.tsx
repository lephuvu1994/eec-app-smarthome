import type { DimensionValue } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { EDeviceProtocol } from '@/lib/api/devices/device.service';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { Text, View } from '@/components/ui';
import { NetworkSignalIndicator } from '@/features/devices/common/components/network-signal-indicator';
import { translate } from '@/lib/i18n';

type TProps = {
  position: SharedValue<number>;
  doorState: string;
  stateColor: string;
  isOnline: boolean;
  protocol?: EDeviceProtocol;
  rssi?: number | null;
  linkquality?: number | null;
};

const config: {
  top: DimensionValue;
  left: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
  bgImage: any;
  doorImage: any;
} = {
  top: '41%',
  left: '26.3%',
  width: '47.8%',
  height: '51.5%',
  bgImage: require('@@/assets/device/cuacuon/anh1.png'),
  doorImage: require('@@/assets/device/cuacuon/anh-cua1.png'),
};

/**
 * ShutterVisualizer - Mô phỏng hiệu ứng cửa cuốn trượt.
 *
 * Kỹ thuật:
 * - Lớp nền (anh-bg1.png) cố định, lớp cửa (anh-cua1.png) trượt bằng translateY.
 * - Container "doorHole" dùng overflow:'hidden' để clip phần cửa vượt ra ngoài.
 * - translateY tính bằng pixel (qua onLayout) để tương thích Reanimated.
 */
export function ShutterVisualizer({ position, doorState, stateColor, isOnline, protocol, rssi, linkquality }: TProps) {
  const doorHoleHeight = useSharedValue(0);

  const animatedDoorStyle = useAnimatedStyle(() => {
    // position: 0 (Đóng, cửa che kín) → 100 (Mở, cửa trượt hết lên trên)
    // translateY: 0 → -doorHoleHeight
    const translateY = doorHoleHeight.value > 0
      ? -(position.value / 100) * doorHoleHeight.value
      : 0;

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View className="aspect-4/3 w-full overflow-hidden">
      {/* 1. Lớp khung nhà (Background) */}
      <Image source={config.bgImage} style={StyleSheet.absoluteFill} contentFit="cover" />

      {/* 2. Vùng chứa cửa — khớp vào ô cửa của ảnh nền */}
      <View
        className="absolute overflow-hidden"
        style={{
          top: config.top,
          left: config.left,
          width: config.width,
          height: config.height,
        }}
        onLayout={(e) => {
          doorHoleHeight.value = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View className="size-full" style={animatedDoorStyle}>
          <Image source={config.doorImage} style={styles.shutterImage} contentFit="fill" />
        </Animated.View>
      </View>

      {/* 3. Overlay pills — nằm trong container nên responsive theo ảnh */}
      <View className="absolute top-3 right-3 flex-row items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 shadow-sm dark:bg-black/60">
        <View className="size-2 rounded-full" style={{ backgroundColor: stateColor }} />
        <Text className="text-xs font-semibold text-black uppercase dark:text-white">{doorState}</Text>
      </View>

      <View className="absolute top-3 left-3 flex-row items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 shadow-sm">
        {protocol && (
          <NetworkSignalIndicator
            protocol={protocol}
            rssi={rssi}
            linkquality={linkquality}
            size={12}
          />
        )}
        <Text className="text-xs font-semibold text-white shadow-sm">
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
