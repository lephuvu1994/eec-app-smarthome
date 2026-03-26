import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import { TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/ui';

export function SwitchModalItem({ device: _device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  const entityOn = entity.currentState === 1 || entity.state === 1;

  return (
    <TouchableOpacity
      className={`h-24 w-[48%] justify-between rounded-xl p-3 ${entityOn ? 'bg-[#A3EC3E]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
      onPress={() => {
        // TODO: Toggle entity via socket or API
        console.log('Toggle (Base):', entity.code);
      }}
      activeOpacity={0.8}
    >
      <View className={`size-3 rounded-full ${entityOn ? 'bg-white' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
      <Text className={`text-lg font-semibold ${entityOn ? 'text-black' : 'text-neutral-800 dark:text-white'}`}>
        {entity.name || entity.code}
      </Text>
    </TouchableOpacity>
  );
}
