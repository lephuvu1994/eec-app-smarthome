import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { ScrollView } from 'react-native';

import { Button, Modal, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

enum EActionButtonCurtanin {
  Open = 'OPEN',
  Close = 'CLOSE',
  Stop = 'STOP',
  Lock = 'LOCK',
}

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  isControlling: boolean;
  onLearn: (action: EActionButtonCurtanin) => void;
};

export function CurtainRfLearnModal({
  modalRef,
  isControlling,
  onLearn,
}: Props) {
  return (
    <Modal ref={modalRef} snapPoints={['40%']} title={translate('deviceDetail.shutter.advanced.rfLearning')}>
      <ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <Text className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
            Chọn một hành động dưới đây để vào chế độ học lệnh RF cho lệnh đó.
          </Text>
          <View className="flex-row flex-wrap justify-between gap-3">
            {[
              { label: translate('deviceDetail.shutter.open'), action: EActionButtonCurtanin.Open },
              { label: translate('deviceDetail.shutter.close'), action: EActionButtonCurtanin.Close },
              { label: translate('deviceDetail.shutter.stop'), action: EActionButtonCurtanin.Stop },
              { label: translate('deviceDetail.shutter.advanced.lock'), action: EActionButtonCurtanin.Lock },
            ].map(item => (
              <Button
                key={item.action}
                className="w-[47%] bg-neutral-100 py-3.5 dark:bg-neutral-700"
                textClassName="text-[#1B1B1B] font-semibold dark:text-white"
                label={item.label}
                onPress={() => onLearn(item.action)}
                disabled={isControlling}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
