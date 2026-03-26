import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import { Modal, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useConfigManager } from '@/stores/config/config';
import { SHUTTER_BACKGROUNDS } from '../../utils/shutter-constants';

type ShutterBackgroundModalProps = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  deviceId: string;
};

export function ShutterBackgroundModal({ modalRef, deviceId }: ShutterBackgroundModalProps) {
  const currentBgId = useConfigManager(s => s.shutterBackgrounds[deviceId]) || '1';
  const setBackground = useConfigManager(s => s.setShutterBackground);

  const handleSelect = (id: string) => {
    setBackground(deviceId, id);
    modalRef.current?.dismiss();
  };

  return (
    <Modal
      ref={modalRef}
      snapPoints={['50%']}
      title={translate('deviceDetail.shutter.changeBackground' as any, { defaultValue: 'Change Background' })}
    >
      <ScrollView contentContainerClassName="p-4 pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between gap-3">
          {SHUTTER_BACKGROUNDS.map((bg: { id: string; source: any }) => {
            const isSelected = bg.id === currentBgId;
            return (
              <TouchableOpacity
                key={bg.id}
                className={cn('aspect-square w-[48%] overflow-hidden rounded-xl border-2', isSelected ? 'border-[#A3E635]' : 'border-transparent')}
                onPress={() => handleSelect(bg.id)}
                activeOpacity={0.8}
              >
                <Image
                  source={bg.source}
                  className="h-full w-full"
                  contentFit="cover"
                />
                {isSelected && (
                  <View className="absolute right-2 bottom-2 h-6 w-6 items-center justify-center rounded-full bg-[#A3E635]">
                    <Text className="text-sm font-bold text-[#1B1B1B]">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Modal>
  );
}
