import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import { ActivityIndicator, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/ui';
import { useSwitchControl } from '@/features/devices/hooks/use-switch-control';

export function SwitchModalItem({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  const { isOn, isLoading, handleToggle } = useSwitchControl(device, entity);

  return (
    <TouchableOpacity
      className={`h-24 w-[48%] justify-between rounded-xl p-3 ${isOn ? 'bg-[#A3E635]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <View className={`size-3 rounded-full ${isOn ? 'bg-white' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
        {isLoading && <ActivityIndicator size="small" color={isOn ? '#000' : '#A3E635'} />}
      </View>
      <Text className={`text-lg font-semibold ${isOn ? 'text-black' : 'text-neutral-800 dark:text-white'}`} numberOfLines={2}>
        {entity.name || entity.code}
      </Text>
    </TouchableOpacity>
  );
}

