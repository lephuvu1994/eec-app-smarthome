import type { BottomSheetBackdropProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { TDeviceTimer } from '@/lib/api/automation/automation.service';
import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';

import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { Button, IS_IOS, Modal, Text, TouchableOpacity, View, WheelPicker } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { useTimerEditor } from './use-timer-editor';

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  device: TDevice;
  entity: TDeviceEntity;
  existingTimer?: TDeviceTimer | null;
  onSuccess?: () => void;
};

export function CountdownEditorSheet({ modalRef, device, entity, existingTimer, onSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const [durationDate, setDurationDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 5, 0, 0);
    return d;
  });
  const [targetValue, setTargetValue] = useState<1 | 0 | 'OPEN' | 'CLOSE' | 'STOP'>(1);

  const isCurtainMotor = entity?.domain === 'curtain' || entity?.domain === 'curtain_switch' || (device?.type === 'SHUTTER_DOOR' && (!entity || entity.code === 'main'));

  useEffect(() => {
    queueMicrotask(() => {
      if (existingTimer) {
        const executeAt = new Date(existingTimer.executeAt);
        const remainingMs = executeAt.getTime() - Date.now();
        const d = new Date();
        if (remainingMs > 0) {
          const totalSecs = Math.floor(remainingMs / 1000);
          const hours = Math.floor(totalSecs / 3600);
          const mins = Math.floor((totalSecs % 3600) / 60);
          d.setHours(hours, mins, 0, 0);
        }
        else {
          d.setHours(0, 0, 0, 0);
        }
        setDurationDate(d);

        const actionVal = existingTimer.actions?.[0]?.value;
        if (actionVal !== undefined) {
          setTargetValue(actionVal as any);
        }
      }
      else {
        setDurationDate((prevDate) => {
          if (prevDate.getHours() === 0 && prevDate.getMinutes() === 5)
            return prevDate;
          const d = new Date();
          d.setHours(0, 5, 0, 0);
          return d;
        });
        setTargetValue(isCurtainMotor ? 'OPEN' : 1);
      }
    });
  }, [existingTimer, isCurtainMotor]);

  if (isCurtainMotor && typeof targetValue === 'number') {
    setTargetValue('OPEN');
  }

  const totalSeconds = durationDate.getHours() * 3600 + durationDate.getMinutes() * 60;

  const { saveTimer, deleteTimer, isSaving, isBusy } = useTimerEditor({
    entity,
    existingTimer,
    onSuccess: () => {
      modalRef.current?.dismiss();
      onSuccess?.();
    },
  });

  // Backdrop that does NOT dismiss on press — prevents Android RNGH
  // Gesture.Tap() on backdrop from intercepting content taps.
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} pressBehavior="none" />
    ),
    [],
  );

  return (
    <Modal ref={modalRef} snapPoints={[insets.bottom + 540]} enableContentPanningGesture={IS_IOS} backdropComponent={!IS_IOS ? renderBackdrop : undefined}>
      <View className="flex-1 pb-4">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between px-4">
          <Text className="text-lg font-bold text-[#1B1B1B] dark:text-white">
            {existingTimer ? translate('automation.countdown.edit') : translate('automation.countdown.title')}
          </Text>
          <TouchableOpacity
            onPress={() => modalRef.current?.dismiss()}
            className="size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <FontAwesome6 name="xmark" size={16} color={isDark ? '#fff' : '#1B1B1B'} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-4">
          {/* Target state toggle */}
          <View className="mb-5 flex-row gap-2">
            {isCurtainMotor
              ? (
                  <View collapsable={false} className="flex-1 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setTargetValue('OPEN')}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${targetValue === 'OPEN' ? 'bg-[#A3E635]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5 name="arrow-up" size={12} color={targetValue === 'OPEN' ? '#1B1B1B' : (isDark ? '#fff' : '#6b7280')} />
                      <Text className={`text-[13px] font-bold ${targetValue === 'OPEN' ? 'text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {translate('deviceDetail.shutter.open')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTargetValue('STOP')}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${targetValue === 'STOP' ? 'bg-amber-400' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5 name="stop" size={12} color={targetValue === 'STOP' ? '#1B1B1B' : (isDark ? '#fff' : '#6b7280')} />
                      <Text className={`text-[13px] font-bold ${targetValue === 'STOP' ? 'text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {translate('deviceDetail.shutter.stop')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTargetValue('CLOSE')}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${targetValue === 'CLOSE' ? 'bg-[#1B1B1B] dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5 name="arrow-down" size={12} color={targetValue === 'CLOSE' ? (isDark ? '#1B1B1B' : '#fff') : (isDark ? '#fff' : '#6b7280')} />
                      <Text className={`text-[13px] font-bold ${targetValue === 'CLOSE' ? 'text-white dark:text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {translate('deviceDetail.shutter.close')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              : (
                  <View collapsable={false} className="flex-1 flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setTargetValue(1)}
                      className={`flex-1 flex-row items-center justify-center gap-3 rounded-2xl py-3 ${targetValue === 1 ? 'bg-[#A3E635]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5 name="power-off" size={14} color={targetValue === 1 ? '#1B1B1B' : (isDark ? '#fff' : '#6b7280')} />
                      <Text className={`text-sm font-bold ${targetValue === 1 ? 'text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {translate('base.on')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTargetValue(0)}
                      className={`flex-1 flex-row items-center justify-center gap-3 rounded-2xl py-3 ${targetValue === 0 ? 'bg-[#1B1B1B] dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      activeOpacity={0.7}
                    >
                      <FontAwesome6 name="power-off" size={14} color={targetValue === 0 ? (isDark ? '#1B1B1B' : '#fff') : (isDark ? '#fff' : '#6b7280')} />
                      <Text className={`text-sm font-bold ${targetValue === 0 ? 'text-white dark:text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {translate('base.off')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
          </View>

          {/* Time Wheel / Picker */}
          <View className="mb-4 w-full items-center justify-center">
            {IS_IOS
              ? (
                  <DateTimePicker
                    display="spinner"
                    value={durationDate}
                    mode="countdown"
                    onChange={(event, selectedDate) => {
                      if (selectedDate)
                        setDurationDate(selectedDate);
                    }}
                    textColor={isDark ? '#FFFFFF' : '#000000'}
                    themeVariant={isDark ? 'dark' : 'light'}
                    style={{ height: 180 }}
                  />
                )
              : (
                  <View className="flex-row items-center justify-center gap-8 px-8">
                    {/* Hours Wheel */}
                    <View className="items-center">
                      <WheelPicker
                        data={Array.from({ length: 24 }, (_, i) => i)}
                        value={durationDate.getHours()}
                        onValueChange={(h) => {
                          const d = new Date(durationDate);
                          d.setHours(h);
                          setDurationDate(d);
                        }}
                        formatLabel={val => val.toString().padStart(2, '0')}
                      />
                      <Text className="mt-2 text-xs font-semibold text-neutral-500 uppercase">Giờ</Text>
                    </View>

                    <Text className="pb-6 text-2xl font-bold dark:text-white">:</Text>

                    {/* Minutes Wheel */}
                    <View className="items-center">
                      <WheelPicker
                        data={Array.from({ length: 60 }, (_, i) => i)}
                        value={durationDate.getMinutes()}
                        onValueChange={(m) => {
                          const d = new Date(durationDate);
                          d.setMinutes(m);
                          setDurationDate(d);
                        }}
                        formatLabel={val => val.toString().padStart(2, '0')}
                      />
                      <Text className="mt-2 text-xs font-semibold text-neutral-500 uppercase">Phút</Text>
                    </View>
                  </View>
                )}
          </View>

          <View className="mb-4">
            <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              {translate('automation.countdown.summary', {
                time: `${durationDate.getHours() > 0 ? `${durationDate.getHours()}h ` : ''}${durationDate.getMinutes() > 0 ? `${durationDate.getMinutes()}p ` : ''}`.trim(),
                state: targetValue === 'OPEN' ? translate('deviceDetail.shutter.open').toLowerCase() : targetValue === 'CLOSE' ? translate('deviceDetail.shutter.close').toLowerCase() : targetValue === 'STOP' ? translate('deviceDetail.shutter.stop').toLowerCase() : targetValue === 1 ? translate('base.on') : translate('base.off'),
              })}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 px-4 pt-2">
          {existingTimer
            ? (
                <Button
                  className="h-12 flex-1 rounded-full bg-red-100 p-0 dark:bg-red-900/30"
                  textClassName="text-base font-semibold text-red-600 dark:text-red-400"
                  label={translate('base.deleteButton')}
                  onPress={() => deleteTimer(existingTimer.id)}
                  disabled={isBusy}
                />
              )
            : null}
          <Button
            className={`h-12 flex-1 rounded-full p-0 shadow-sm ${totalSeconds === 0 || isBusy ? 'bg-[#A3E635]/50 dark:bg-[#A3E635]/50' : 'bg-[#A3E635] dark:bg-[#A3E635]'}`}
            textClassName="text-base font-semibold text-[#0F0F0F] dark:text-[#0F0F0F]"
            label={translate('base.save')}
            onPress={() => saveTimer(totalSeconds, targetValue)}
            loading={isSaving}
            disabled={totalSeconds === 0 || isBusy}
          />
        </View>
      </View>
    </Modal>
  );
}
