import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, TouchableOpacity } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUniwind } from 'uniwind';
import { Button, HEIGHT, IS_IOS, Modal, Text, View } from '@/components/ui';
import { Select } from '@/components/ui/select';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type TConfigPayload = {
  clicks?: number;
  start_time?: string;
  end_time?: string;
};

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  isControlling: boolean;
  onConfig: (config: TConfigPayload) => void;
  initialConfig?: TConfigPayload;
};

const clickOptions = Array.from({ length: 5 }).map((_, i) => ({
  label: `${i + 1} lần`,
  value: i + 1,
}));

export function CurtainMotorConfigModal({
  modalRef,
  isControlling,
  onConfig,
  initialConfig,
}: Props) {
  const [clicks, setClicks] = useState<number | undefined>(initialConfig?.clicks ?? 2);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    if (initialConfig?.start_time) {
      const [h, m] = initialConfig.start_time.split(':').map(Number);
      d.setHours(h || 0, m || 0);
      return d;
    }
    d.setHours(0, 0);
    return d;
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    if (initialConfig?.end_time) {
      const [h, m] = initialConfig.end_time.split(':').map(Number);
      d.setHours(h ?? 23, m ?? 59);
      return d;
    }
    d.setHours(23, 59);
    d.setHours(23, 59);
    return d;
  });

  const [showAndroidPicker, setShowAndroidPicker] = useState<'start' | 'end' | null>(null);

  // Sync state if initialConfig updates asynchronously (e.g. from MQTT)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialConfig?.clicks !== undefined) {
        setClicks(initialConfig.clicks);
      }
      if (initialConfig?.start_time) {
        const d = new Date();
        d.setSeconds(0, 0);
        const [h, m] = initialConfig.start_time.split(':').map(Number);
        d.setHours(h || 0, m || 0);
        setStartDate(d);
      }
      if (initialConfig?.end_time) {
        const d = new Date();
        d.setSeconds(0, 0);
        const [h, m] = initialConfig.end_time.split(':').map(Number);
        d.setHours(h ?? 23, m ?? 59);
        setEndDate(d);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [initialConfig]);

  const insets = useSafeAreaInsets();

  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const formatTime = (_date: Date) => {
    return `${_date.getHours().toString().padStart(2, '0')}:${_date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(null);
    }
    if (selectedDate) {
      if (showAndroidPicker === 'start' || (!showAndroidPicker && (_event as any).target)) {
        // If inline or explicitly start
        setStartDate(selectedDate);
      }
      else {
        setEndDate(selectedDate);
      }
    }
  };

  const handleSave = () => {
    const payload: TConfigPayload = {
      start_time: formatTime(startDate),
      end_time: formatTime(endDate),
    };
    if (clicks) {
      payload.clicks = clicks;
    }

    onConfig(payload);
    modalRef.current?.dismiss();
  };

  return (
    <Modal ref={modalRef} snapPoints={[insets.bottom + HEIGHT * 0.65]} title={translate('deviceDetail.shutter.advanced.buttonConfig')}>
      <ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
          <View className="gap-5">
            <View className="z-10">
              <Select
                label={translate('deviceDetail.shutter.advanced.clicks')}
                value={clicks}
                onSelect={val => setClicks(Number(val))}
                options={clickOptions}
                placeholder="Chọn số lần click"
              />
            </View>

            {/* Operating Hours Configuration */}
            <View className="z-0">
              <Text className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                {translate('deviceDetail.shutter.advanced.workingHours')}
              </Text>
              {IS_IOS && (
                <View className="flex-row justify-between gap-4">
                  <View className="flex-1 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 py-2 dark:border-neutral-700 dark:bg-[#FFFFFF0D]">
                    <Text className="mb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Giờ Bắt Đầu</Text>
                    <View style={{ width: '120%', height: 160, alignItems: 'center', transform: [{ scale: 0.85 }] }}>
                      <DateTimePicker
                        value={startDate}
                        {...({ mode: 'time' } as any)}
                        display="spinner"
                        minuteInterval={1}
                        locale="vi-VN"
                        textColor={isDark ? '#FFFFFF' : '#000000'}
                        onChange={handleDateChange}
                        style={{ height: 110, width: '100%' }}
                      />
                    </View>
                  </View>

                  <View className="flex-1 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 py-2 dark:border-neutral-700 dark:bg-[#FFFFFF0D]">
                    <Text className="mb-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Giờ Kết Thúc</Text>
                    <View style={{ width: '120%', height: 160, alignItems: 'center', transform: [{ scale: 0.85 }] }}>
                      <DateTimePicker
                        value={endDate}
                        {...({ mode: 'time' } as any)}
                        display="spinner"
                        minuteInterval={1}
                        locale="vi-VN"
                        textColor={isDark ? '#FFFFFF' : '#000000'}
                        onChange={(_e, d) => {
                          if (d) {
                            setEndDate(d);
                          }
                        }}
                        style={{ height: 110, width: '100%' }}
                      />
                    </View>
                  </View>
                </View>
              )}

              {!IS_IOS && (
                <View className="flex-row justify-between gap-4">
                  <TouchableOpacity
                    className="flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 py-5 dark:border-neutral-700 dark:bg-neutral-800"
                    onPress={() => setShowAndroidPicker('start')}
                  >
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400">Giờ Bắt Đầu</Text>
                    <Text className="mt-1 text-xl font-bold text-[#1B1B1B] dark:text-white">{formatTime(startDate)}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 py-5 dark:border-neutral-700 dark:bg-neutral-800"
                    onPress={() => setShowAndroidPicker('end')}
                  >
                    <Text className="text-xs text-neutral-500 dark:text-neutral-400">Giờ Kết Thúc</Text>
                    <Text className="mt-1 text-xl font-bold text-[#1B1B1B] dark:text-white">{formatTime(endDate)}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Android Overlay Picker */}
              {!IS_IOS && showAndroidPicker !== null && (
                <DateTimePicker
                  value={showAndroidPicker === 'start' ? startDate : endDate}
                  {...({ mode: 'time' } as any)}
                  display="spinner"
                  minuteInterval={1}
                  is24Hour={true}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <Button
              className="mt-4 h-[52px] w-full bg-[#A3E635]"
              textClassName="text-[15px] font-bold text-[#1B1B1B]"
              label={translate('deviceDetail.shutter.advanced.saveConfig')}
              disabled={isControlling}
              onPress={handleSave}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
