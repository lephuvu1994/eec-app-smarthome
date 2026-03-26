import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import { FontAwesome6 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/ui';
import { useShutterControl } from '@/features/devices/hooks/use-shutter-control';

export function CurtainModalItem({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  const { position, isControlling, handleOpen, handleClose, handleStop } = useShutterControl(device, entity);

  return (
    <View className="w-full rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
      <View className="mb-4 flex-row items-center justify-between px-2">
        <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
          {entity.name || entity.code}
        </Text>
        <Text className="text-sm font-bold text-[#A3E635]">
          {position}
          %
        </Text>
      </View>
      <View className="flex-row items-center justify-between px-4">
        <TouchableOpacity
          onPress={handleClose}
          disabled={isControlling}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-700"
        >
          <FontAwesome6 name="chevron-down" size={20} color={isControlling ? 'gray' : '#1B1B1B'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStop}
          disabled={isControlling}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A3E635] shadow-md"
        >
          <FontAwesome6 name="pause" size={20} color="#1B1B1B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpen}
          disabled={isControlling}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-700"
        >
          <FontAwesome6 name="chevron-up" size={20} color={isControlling ? 'gray' : '#1B1B1B'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
