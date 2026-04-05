import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import { FontAwesome6 } from '@expo/vector-icons';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Modal, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  device: TDevice;
  entities: TDeviceEntity[];
  onSelect: (entity: TDeviceEntity) => void;
  title?: string;
};

export function SelectEntitySheet({ modalRef, device, entities, onSelect, title }: Props) {
  const insets = useSafeAreaInsets();
  const snapHeight = insets.bottom + 140 + entities.length * 76;

  const handleSelect = (entity: TDeviceEntity) => {
    modalRef.current?.dismiss();
    // small delay so modal animates out before navigation
    setTimeout(onSelect, 200, entity);
  };

  return (
    <Modal
      ref={modalRef}
      snapPoints={[Math.min(snapHeight, 500)]}
      title={title ?? translate('automation.selectEntity.title')}
    >
      <View className="px-5 pb-6">
        <Text className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          {translate('automation.selectEntity.subtitle', { name: device.name })}
        </Text>

        <View className="gap-2">
          {entities.map(entity => (
            <TouchableOpacity
              key={entity.id}
              onPress={() => handleSelect(entity)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800"
            >
              <View className="flex-row items-center gap-3">
                <View className="size-9 items-center justify-center rounded-full bg-white dark:bg-neutral-700">
                  <FontAwesome6 name="toggle-on" size={16} color="#A3E635" />
                </View>
                <Text className="text-base font-semibold text-[#1B1B1B] dark:text-white">
                  {entity.name || entity.code}
                </Text>
              </View>
              <FontAwesome6 name="chevron-right" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}
