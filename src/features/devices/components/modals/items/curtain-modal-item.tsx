import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import { FontAwesome6 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import Animated, { useAnimatedProps, useDerivedValue } from 'react-native-reanimated';

import { View } from '@/components/ui';
import { CurtainSlider } from '@/features/devices/components/curtain-slider';
import { useShutterControl } from '@/features/devices/hooks/use-shutter-control';

export function CurtainModalItem({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  const { position, isControlling, handleOpen, handleClose, handleStop, handlePosition } = useShutterControl(device, entity);

  const positionText = useDerivedValue(() => `${Math.round(position.value)}%`);
  const animatedProps = useAnimatedProps(() => ({ text: positionText.value } as any));

  return (
    <View className="w-full rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
      <View className="mb-4 items-center justify-center">
        <Animated.Text
          animatedProps={animatedProps}
          className="mb-2 text-xl font-bold text-[#A3E635]"
        />
        <CurtainSlider
          position={position}
          onSlidingComplete={handlePosition}
          disabled={true} // Tạm khóa tính năng điều khiển vị trí
        />
      </View>
      <View className="mt-2 flex-row items-center justify-between px-4">
        <TouchableOpacity
          onPress={handleClose}
          disabled={isControlling}
          className="flex size-14 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-700"
        >
          <FontAwesome6 name="chevron-down" size={20} color={isControlling ? 'gray' : '#1B1B1B'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStop}
          disabled={isControlling}
          className="flex size-16 items-center justify-center rounded-full bg-[#A3E635] shadow-md"
        >
          <FontAwesome6 name="pause" size={20} color="#1B1B1B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpen}
          disabled={isControlling}
          className="flex size-14 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-700"
        >
          <FontAwesome6 name="chevron-up" size={20} color={isControlling ? 'gray' : '#1B1B1B'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
