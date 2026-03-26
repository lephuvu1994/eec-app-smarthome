import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import { ActivityIndicator, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/ui';
import { useLightControl } from '@/features/devices/hooks/use-light-control';

export function LightModalItem({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  const { isOn, isLoading, handleToggle } = useLightControl(device, entity);

  // Todo: Implement mini Slider for brightness inside this modal block if needed.
  // For the V1 of the expand modal, we typically show a standard toggle that matches the switch block,
  // letting the detail screen handle complex brightness.
  
  return (
    <TouchableOpacity
      className={`h-24 w-[48%] justify-between rounded-xl p-3 ${isOn ? 'bg-[#FDE047]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
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
