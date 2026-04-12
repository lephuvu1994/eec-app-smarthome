import type { BottomSheetBackdropProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { TDeviceSchedule } from '@/types/automation';
import type { TDevice, TDeviceEntity } from '@/types/device';

import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { useUniwind } from 'uniwind';
import { Button, IS_IOS, Modal, Switch, Text, View, WheelPicker } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { useScheduleEditor } from './use-schedule-editor';

// ─── Days Setup ─────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = [
  { value: 1, label: translate('base.days.monShort') },
  { value: 2, label: translate('base.days.tueShort') },
  { value: 3, label: translate('base.days.wedShort') },
  { value: 4, label: translate('base.days.thuShort') },
  { value: 5, label: translate('base.days.friShort') },
  { value: 6, label: translate('base.days.satShort') },
  { value: 0, label: translate('base.days.sunShort') },
];

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  device: TDevice;
  entity: TDeviceEntity;
  existingSchedule?: TDeviceSchedule | null;
  onSuccess?: () => void;
};

export function ScheduleEditorSheet({ modalRef, device, entity, existingSchedule, onSuccess }: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  // ─── Form State ──────────────────────────────────────────────────────────
  const [time, setTime] = useState(() => new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [targetValue, setTargetValue] = useState<1 | 0 | 'OPEN' | 'CLOSE' | 'STOP'>(1);
  const [enableNotification, setEnableNotification] = useState<boolean>(true);

  const isCurtain = entity?.domain === 'curtain' || entity?.domain === 'curtain_switch' || device?.type === 'SHUTTER_DOOR';

  // Hydrate existing schedule when opened
  useEffect(() => {
    queueMicrotask(() => {
      if (existingSchedule) {
        if (existingSchedule.timeOfDay) {
          const [hours, minutes] = existingSchedule.timeOfDay.split(':').map(Number);
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);
          setTime(d);
        }
        if (existingSchedule.daysOfWeek?.length) {
          setSelectedDays(existingSchedule.daysOfWeek);
        }
        const actionVal = existingSchedule.actions?.[0]?.value;
        if (actionVal !== undefined) {
          setTargetValue(actionVal as any);
        }
        // Note: Enable notification toggle state mapped if required (currently not in backend TDeviceSchedule)
      }
      else {
        // Defaults
        setTime(new Date());
        setSelectedDays([1, 2, 3, 4, 5]);
        setTargetValue(isCurtain ? 'OPEN' : 1);
        setEnableNotification(true);
      }
    });
  }, [existingSchedule, isCurtain]);

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort((a, b) => {
            const getOrder = (val: number) => (val === 0 ? 7 : val);
            return getOrder(a) - getOrder(b);
          }),
    );
  };

  const { saveSchedule, deleteSchedule, isSaving, isBusy } = useScheduleEditor({
    entity,
    existingSchedule,
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
    <Modal ref={modalRef} snapPoints={['80%']} enableContentPanningGesture={IS_IOS} backdropComponent={!IS_IOS ? renderBackdrop : undefined}>
      <View className="flex-1 pb-4">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between px-4">
          <Text className="text-xl font-bold text-[#1B1B1B] dark:text-white">
            {existingSchedule ? translate('automation.schedule.edit') : translate('automation.schedule.createNew')}
          </Text>
          <TouchableOpacity
            onPress={() => modalRef.current?.dismiss()}
            className="size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <FontAwesome6 name="xmark" size={16} color={isDark ? '#fff' : '#1B1B1B'} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Target Value */}
          <View className="mb-6 flex-row gap-2">
            {isCurtain
              ? (
                  <>
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
                  </>
                )
              : (
                  <>
                    <TouchableOpacity
                      onPress={() => setTargetValue(1)}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${targetValue === 1 ? 'bg-[#A3E635]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      activeOpacity={0.7}
                    >
                      <FontAwesome5 name="power-off" size={14} color={targetValue === 1 ? '#1B1B1B' : (isDark ? '#fff' : '#6b7280')} />
                      <Text className={`text-sm font-bold ${targetValue === 1 ? 'text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {translate('base.on')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setTargetValue(0)}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${targetValue === 0 ? 'bg-[#1B1B1B] dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      activeOpacity={0.7}
                    >
                      <FontAwesome6 name="power-off" size={14} color={targetValue === 0 ? (isDark ? '#1B1B1B' : '#fff') : (isDark ? '#fff' : '#6b7280')} />
                      <Text className={`text-sm font-bold ${targetValue === 0 ? 'text-white dark:text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {translate('base.off')}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
          </View>

          {/* Time Picker */}
          <View className="mb-6 items-center justify-center py-2">
            {IS_IOS
              ? (
                  <RNDateTimePicker
                    value={time}
                    mode="time"
                    display="spinner"
                    onChange={(_, date) => date && setTime(date)}
                    textColor={isDark ? '#FFFFFF' : '#000000'}
                    themeVariant={isDark ? 'dark' : 'light'}
                    style={{ height: 180 }}
                  />
                )
              : (
                  <View className="flex-row items-center justify-center gap-4 py-4">
                    <WheelPicker
                      data={Array.from({ length: 24 }, (_, i) => i)}
                      value={time.getHours()}
                      onValueChange={(val: number) => {
                        const newTime = new Date(time);
                        newTime.setHours(val);
                        setTime(newTime);
                      }}
                      formatLabel={val => val.toString().padStart(2, '0')}
                    />
                    <Text className="text-3xl font-bold text-[#1B1B1B] dark:text-white">:</Text>
                    <WheelPicker
                      data={Array.from({ length: 60 }, (_, i) => i)}
                      value={time.getMinutes()}
                      onValueChange={(val: number) => {
                        const newTime = new Date(time);
                        newTime.setMinutes(val);
                        setTime(newTime);
                      }}
                      formatLabel={val => val.toString().padStart(2, '0')}
                    />
                  </View>
                )}
          </View>

          {/* Days of Week */}
          <View className="mb-6">
            <Text className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {translate('automation.schedule.repeat')}
            </Text>
            <View className="flex-row justify-between">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDays.includes(d.value);
                return (
                  <TouchableOpacity
                    key={d.value}
                    onPress={() => toggleDay(d.value)}
                    activeOpacity={0.7}
                    className={`size-[42px] items-center justify-center rounded-full ${isSelected ? 'bg-[#1B1B1B] dark:bg-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                  >
                    <Text className={`text-xs font-bold ${isSelected ? 'text-white dark:text-[#1B1B1B]' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Push Notification Toggle */}
          <View className="mb-8 rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="size-8 items-center justify-center rounded-full bg-white dark:bg-neutral-700">
                  <FontAwesome5 name="bell" size={14} color={isDark ? '#A3E635' : '#1B1B1B'} />
                </View>
                <Text className="text-sm font-medium text-[#1B1B1B] dark:text-white">
                  {translate('settings.notification.enablePush')}
                </Text>
              </View>
              <Switch checked={enableNotification} onChange={setEnableNotification} accessibilityLabel="enable notification" />
            </View>
          </View>
        </BottomSheetScrollView>

        <View className="flex-row gap-3 px-4 pt-2">
          {existingSchedule
            ? (
                <Button
                  className="h-12 flex-1 rounded-full bg-red-100 p-0 dark:bg-red-900/30"
                  textClassName="text-base font-semibold text-red-600 dark:text-red-400"
                  label={translate('base.deleteButton')}
                  onPress={() => deleteSchedule(existingSchedule.id)}
                  disabled={isBusy}
                />
              )
            : null}
          <Button
            className={`h-12 flex-1 rounded-full p-0 shadow-sm ${isBusy ? 'bg-[#A3E635]/50 dark:bg-[#A3E635]/50' : 'bg-[#A3E635] dark:bg-[#A3E635]'}`}
            textClassName="text-base font-semibold text-[#0F0F0F] dark:text-[#0F0F0F]"
            label={translate('base.save')}
            onPress={() => saveSchedule(time, selectedDays, targetValue)}
            loading={isSaving}
            disabled={isBusy}
          />
        </View>
      </View>
    </Modal>
  );
}
