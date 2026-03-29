import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, useModal, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { isPrimaryEntity } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { SwitchModalItem } from '../components/modals/items/switch-modal-item';
import { TimelinePopover } from '../components/modals/timeline-popover';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function SwitchDetailScreen({ deviceId }: Props) {
  const router = useRouter();
  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;
  const timelineModal = useModal();

  if (!device) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-900">
        <Text className="text-white">{translate('base.somethingWentWrong')}</Text>
      </SafeAreaView>
    );
  }

  const primaryEntities = (device.entities ?? []).filter(isPrimaryEntity);

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
          >
            <FontAwesome name="chevron-left" size={18} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold tracking-wide text-white">
            {device.name}
          </Text>
          <TouchableOpacity
            onPress={timelineModal.present}
            className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
          >
            <FontAwesome name="bell-o" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView className="mt-6 flex-1 px-4">
          <Text className="mb-6 px-2 text-2xl font-bold text-white">
            {translate('base.device')}
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4 px-2">
            {primaryEntities.map(entity => (
              <SwitchModalItem key={entity.id} device={device} entity={entity} />
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>

      <TimelinePopover modalRef={timelineModal.ref} deviceId={deviceId} />
    </View>
  );
}
