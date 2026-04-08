import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FontAwesome5 } from '@expo/vector-icons';
import * as React from 'react';
import { useState } from 'react';

import { colors, Modal, ScrollView, Switch, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  isControlling: boolean;
  onBleMode: (on: boolean) => void;
};

export function CurtainBleModal({
  modalRef,
  isControlling,
  onBleMode,
}: Props) {
  const [bleEnabled, setBleEnabled] = useState(false);

  const handleToggleBle = (val: boolean) => {
    setBleEnabled(val);
    onBleMode(val);
  };

  return (
    <Modal ref={modalRef} snapPoints={['30%']} title={translate('deviceDetail.shutter.advanced.bleMode')}>
      <ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <View className="mr-3 items-center justify-center rounded-full bg-blue-50 p-2.5 dark:bg-blue-900/30">
            <FontAwesome5 name="bluetooth-b" size={18} color="#3B82F6" />
          </View>
          <View className="flex-1 pr-4">
            <Text className="text-base font-bold text-[#1B1B1B] dark:text-white">{translate('deviceDetail.shutter.advanced.bleMode')}</Text>
            <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{translate('deviceDetail.shutter.advanced.bleModeDesc')}</Text>
          </View>
          <Switch activeColor={colors.neon} accessibilityLabel={translate('deviceDetail.shutter.advanced.bleMode')} checked={bleEnabled} onChange={handleToggleBle} disabled={isControlling} />
        </View>
      </ScrollView>
    </Modal>
  );
}
