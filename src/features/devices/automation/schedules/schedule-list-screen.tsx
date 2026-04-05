import type { TDeviceSchedule } from '@/lib/api/automation/automation.service';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as React from 'react';
import { useLayoutEffect } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { ScrollView, Switch, Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';
import { ScheduleEditorSheet } from './schedule-editor-sheet';
import { useSchedules } from './use-schedules';

// ─── Main Component ──────────────────────────────────────────────────────────
export function ScheduleListScreen() {
  const { id: deviceId, entityId } = useLocalSearchParams<{ id: string; entityId: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;
  const entity = device?.entities?.find(e => e.id === entityId);

  const editorModal = useModal();
  const [selectedSchedule, setSelectedSchedule] = React.useState<TDeviceSchedule | null>(null);

  // Query schedules & mutation
  const { schedules, isLoadingSchedules: isLoading, toggleSchedule } = useSchedules(entity);

  const schedulesForEntity = schedules;

  const handleCreate = React.useCallback(() => {
    setSelectedSchedule(null);
    editorModal.present();
  }, [editorModal]);

  const handleEdit = (schedule: TDeviceSchedule) => {
    setSelectedSchedule(schedule);
    editorModal.present();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Animated.View entering={FadeInDown.duration(300)} className="items-center">
          <Text className="text-[17px] font-semibold text-[#1B1B1B] dark:text-white" numberOfLines={1}>
            {translate('automation.schedule.title')}
          </Text>
          <Text className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            {entity?.name || entity?.code || device?.name}
          </Text>
        </Animated.View>
      ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="size-9 items-center justify-center"
        >
          <MaterialCommunityIcons name="close" size={24} color={isDark ? '#FFF' : '#1B1B1B'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleCreate}
          activeOpacity={0.7}
          className="size-9 items-center justify-center"
        >
          <MaterialCommunityIcons name="plus" size={24} color={isDark ? '#FFF' : '#1B1B1B'} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDark, entity, device, handleCreate]);

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: headerHeight + 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pb-4">
            <View className="mb-2 flex-row items-center gap-2 px-1">
              <MaterialCommunityIcons
                name="calendar-clock"
                size={16}
                color={isDark ? '#6366F1' : '#4F46E5'}
              />
              <Text className="text-[13px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                {translate('automation.schedule.title')}
              </Text>
              <View className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 dark:bg-indigo-900/40">
                <Text className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  {schedulesForEntity.length}
                </Text>
              </View>
            </View>

            {(isLoading && schedulesForEntity.length === 0)
              ? (
                  <View className="items-center justify-center py-10">
                    <ActivityIndicator color="#6366F1" />
                  </View>
                )
              : (
                  <Animated.View
                    className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
                    layout={LinearTransition}
                  >
                    {schedulesForEntity.length > 0
                      ? (
                          schedulesForEntity.map((schedule, idx) => {
                            const targetAction = schedule.actions?.[0]?.value as number | string;
                            const isActionOn = targetAction === 1 || targetAction;

                            let actionText = translate('base.off').toUpperCase();
                            if (isActionOn)
                              actionText = translate('base.on').toUpperCase();
                            if (targetAction === 'OPEN')
                              actionText = translate('deviceDetail.shutter.open').toUpperCase();
                            if (targetAction === 'STOP')
                              actionText = translate('deviceDetail.shutter.stop').toUpperCase();
                            if (targetAction === 'CLOSE')
                              actionText = translate('deviceDetail.shutter.close').toUpperCase();

                            return (
                              <Animated.View key={schedule.id} layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
                                <TouchableOpacity
                                  className="flex-row items-center justify-between p-4"
                                  activeOpacity={0.7}
                                  onPress={() => handleEdit(schedule)}
                                >
                                  <View className="flex-1">
                                    <View className="mb-1 flex-row items-center gap-2">
                                      <Text className={`text-2xl font-bold ${schedule.isActive ? 'text-[#1B1B1B] dark:text-white' : 'text-neutral-400 dark:text-neutral-600'}`}>
                                        {schedule.timeOfDay}
                                      </Text>
                                      <View className={`rounded-sm px-1.5 py-0.5 ${(isActionOn || targetAction === 'OPEN') ? 'bg-[#A3E635]/20' : (targetAction === 'STOP' ? 'bg-amber-400/20' : 'bg-neutral-200 dark:bg-neutral-700')}`}>
                                        <Text className={`text-[10px] font-bold ${(isActionOn || targetAction === 'OPEN') ? 'text-[#1B1B1B] dark:text-[#A3E635]' : (targetAction === 'STOP' ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-300')}`}>
                                          {actionText}
                                        </Text>
                                      </View>
                                    </View>
                                    {schedule.daysOfWeek?.length > 0 && (
                                      <Text className={`text-[11px] font-medium ${schedule.isActive ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                        {schedule.daysOfWeek.map((d: number) => {
                                          const map: any = {
                                            1: translate('base.days.monShort'),
                                            2: translate('base.days.tueShort'),
                                            3: translate('base.days.wedShort'),
                                            4: translate('base.days.thuShort'),
                                            5: translate('base.days.friShort'),
                                            6: translate('base.days.satShort'),
                                            0: translate('base.days.sunShort'),
                                          };
                                          return map[d];
                                        }).join(', ')}
                                      </Text>
                                    )}
                                  </View>
                                  <View onStartShouldSetResponder={() => true}>
                                    <Switch
                                      checked={schedule.isActive}
                                      accessibilityLabel="Toggle schedule"
                                      onChange={val => toggleSchedule(schedule.id, val)}
                                    />
                                  </View>
                                </TouchableOpacity>
                                {idx < schedulesForEntity.length - 1 && (
                                  <View className="mx-4 h-px bg-neutral-100 dark:bg-neutral-700" />
                                )}
                              </Animated.View>
                            );
                          })
                        )
                      : (
                          <View className="items-center justify-center p-8">
                            <MaterialCommunityIcons name="calendar-blank" size={32} color={isDark ? '#525252' : '#D4D4D4'} />
                            <Text className="mt-3 text-center text-sm font-medium text-neutral-500">
                              {translate('automation.schedule.noSchedules')}
                            </Text>
                            <Text className="mt-1 text-center text-xs text-neutral-400">
                              {translate('automation.schedule.tapToAdd')}
                            </Text>
                          </View>
                        )}
                  </Animated.View>
                )}
          </View>
        </ScrollView>

        {/* Editor Sheet */}
        {device && entity && (
          <ScheduleEditorSheet
            modalRef={editorModal.ref}
            device={device}
            entity={entity}
            existingSchedule={selectedSchedule}
            onSuccess={() => {
            // Optional: refetch handled by react-query internally
            }}
          />
        )}
      </View>
    </BottomSheetModalProvider>
  );
}
