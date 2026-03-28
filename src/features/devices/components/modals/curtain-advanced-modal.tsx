import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useState } from 'react';
import { ScrollView, Switch } from 'react-native';

import { Button, FloatInput, Modal, Text, View } from '@/components/ui';
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
  onBleMode: (on: boolean) => void;
  onLearn: (action: EActionButtonCurtanin) => void;
  onConfig: (config: { clicks?: number; workHours?: number; travel?: number }) => void;
  onOta: (url: string) => void;
};

export function CurtainAdvancedModal({
  modalRef,
  isControlling,
  onBleMode,
  onLearn,
  onConfig,
  onOta,
}: Props) {
  const [bleEnabled, setBleEnabled] = useState(false);
  const [clicks, setClicks] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [travelMs, setTravelMs] = useState('');
  const [otaUrl, setOtaUrl] = useState('');

  const handleToggleBle = (val: boolean) => {
    setBleEnabled(val);
    onBleMode(val);
  };

  return (
    <Modal ref={modalRef} snapPoints={['80%']} title={translate('deviceDetail.shutter.advanced.title')}>
      <ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
        {/* BLE SECTION */}
        <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <View>
            <Text className="text-base font-bold text-[#1B1B1B]">{translate('deviceDetail.shutter.advanced.bleMode')}</Text>
            <Text className="text-xs text-neutral-500">{translate('deviceDetail.shutter.advanced.bleModeDesc')}</Text>
          </View>
          <Switch value={bleEnabled} onValueChange={handleToggleBle} disabled={isControlling} />
        </View>

        {/* RF LEARN SECTION */}
        <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-3 text-base font-bold text-[#1B1B1B]">{translate('deviceDetail.shutter.advanced.rfLearning')}</Text>
          <View className="flex-row flex-wrap justify-between gap-2">
            {[
              { label: translate('deviceDetail.shutter.open'), action: EActionButtonCurtanin.Open },
              { label: translate('deviceDetail.shutter.close'), action: EActionButtonCurtanin.Close },
              { label: translate('deviceDetail.shutter.stop'), action: EActionButtonCurtanin.Stop },
              { label: translate('deviceDetail.shutter.advanced.lock'), action: EActionButtonCurtanin.Lock },
            ].map(item => (
              <Button
                key={item.action}
                className="w-[48%] bg-neutral-100 py-3"
                textClassName="text-[#1B1B1B]"
                label={item.label}
                onPress={() => onLearn(item.action)}
                disabled={isControlling}
              />
            ))}
          </View>
        </View>

        {/* MOTOR CONFIG SECTION */}
        <View className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-3 text-base font-bold text-[#1B1B1B]">{translate('deviceDetail.shutter.advanced.motorConfig')}</Text>
          <View className="gap-3">
            <FloatInput
              label={translate('deviceDetail.shutter.advanced.clicks')}
              value={clicks}
              onChangeText={setClicks}
              keyboardType="number-pad"
              labelTextColor="#1B1B1B"
              labelTextColorInactive="#6B7280"
              inputClassName="text-[#1B1B1B]"
              borderColor={{ active: '#A3E635', inactive: '#E5E7EB' }}
            />
            <FloatInput
              label={translate('deviceDetail.shutter.advanced.workingHours')}
              value={workHours}
              onChangeText={setWorkHours}
              keyboardType="number-pad"
              labelTextColor="#1B1B1B"
              labelTextColorInactive="#6B7280"
              inputClassName="text-[#1B1B1B]"
              borderColor={{ active: '#A3E635', inactive: '#E5E7EB' }}
            />
            <FloatInput
              label={translate('deviceDetail.shutter.advanced.travelMsPlaceholder')}
              value={travelMs}
              onChangeText={setTravelMs}
              keyboardType="number-pad"
              labelTextColor="#1B1B1B"
              labelTextColorInactive="#6B7280"
              inputClassName="text-[#1B1B1B]"
              borderColor={{ active: '#A3E635', inactive: '#E5E7EB' }}
            />
            <Button
              className="mt-2 bg-[#A3E635]"
              textClassName="text-[#1B1B1B]"
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
              }}
            />
          </View>
        </View>

        {/* OTA SECTION */}
        <View className="rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-3 text-base font-bold text-[#1B1B1B]">{translate('deviceDetail.shutter.advanced.otaUpdate')}</Text>
          <View className="gap-3">
            <FloatInput
              label={translate('deviceDetail.shutter.advanced.otaUrl')}
              value={otaUrl}
              onChangeText={setOtaUrl}
              labelTextColor="#1B1B1B"
              labelTextColorInactive="#6B7280"
              inputClassName="text-[#1B1B1B]"
              borderColor={{ active: '#A3E635', inactive: '#E5E7EB' }}
            />
            <Button
              className="mt-2 bg-[#1B1B1B]"
              textClassName="text-white"
              label={translate('deviceDetail.shutter.advanced.updateOta')}
              disabled={isControlling || !otaUrl}
              onPress={() => onOta(otaUrl)}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
