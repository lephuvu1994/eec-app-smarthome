import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { useUniwind } from 'uniwind';

import { Button, FloatInput, Modal, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  isControlling: boolean;
  onConfig: (config: { clicks?: number; workHours?: number; travel?: number }) => void;
};

export function CurtainMotorConfigModal({
  modalRef,
  isControlling,
  onConfig,
}: Props) {
  const [clicks, setClicks] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [travelMs, setTravelMs] = useState('');
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  return (
    <Modal ref={modalRef} snapPoints={['65%']} title={translate('deviceDetail.shutter.advanced.motorConfig')}>
      <ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
          <View className="gap-4">
            <FloatInput
              label={translate('deviceDetail.shutter.advanced.clicks')}
              value={clicks}
              onChangeText={setClicks}
              keyboardType="number-pad"
              labelTextColor={isDark ? '#FFF' : '#1B1B1B'}
              labelTextColorInactive={isDark ? '#9CA3AF' : '#6B7280'}
              inputClassName="text-[#1B1B1B] dark:text-white"
              borderColor={{ active: '#A3E635', inactive: isDark ? '#404040' : '#E5E7EB' }}
            />
            <FloatInput
              label={translate('deviceDetail.shutter.advanced.workingHours')}
              value={workHours}
              onChangeText={setWorkHours}
              keyboardType="number-pad"
              labelTextColor={isDark ? '#FFF' : '#1B1B1B'}
              labelTextColorInactive={isDark ? '#9CA3AF' : '#6B7280'}
              inputClassName="text-[#1B1B1B] dark:text-white"
              borderColor={{ active: '#A3E635', inactive: isDark ? '#404040' : '#E5E7EB' }}
            />
            <FloatInput
              label={translate('deviceDetail.shutter.advanced.travelMsPlaceholder')}
              value={travelMs}
              onChangeText={setTravelMs}
              keyboardType="number-pad"
              labelTextColor={isDark ? '#FFF' : '#1B1B1B'}
              labelTextColorInactive={isDark ? '#9CA3AF' : '#6B7280'}
              inputClassName="text-[#1B1B1B] dark:text-white"
              borderColor={{ active: '#A3E635', inactive: isDark ? '#404040' : '#E5E7EB' }}
            />
            <Button
              className="mt-4 bg-[#A3E635] py-4"
              textClassName="text-[#1B1B1B] text-[15px] font-bold"
              label={translate('deviceDetail.shutter.advanced.saveConfig')}
              disabled={isControlling}
              onPress={() => {
                const payload: any = {};
                if (clicks) {
                  payload.clicks = Number(clicks);
                }
                if (workHours) {
                  payload.workHours = Number(workHours);
                }
                if (travelMs) {
                  payload.travel = Number(travelMs);
                }
                onConfig(payload);
                modalRef.current?.dismiss();
              }}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
