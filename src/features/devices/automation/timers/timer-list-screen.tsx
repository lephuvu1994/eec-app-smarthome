import type { TDeviceTimer } from '@/lib/api/automation/automation.service';

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
import { ScrollView, Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';
import { CountdownEditorSheet } from './countdown-editor-sheet';
import { useTimers } from './use-timers';

// ─── Main Component ──────────────────────────────────────────────────────────
export function TimerListScreen() {
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
  const [selectedTimer, setSelectedTimer] = React.useState<TDeviceTimer | null>(null);

  // Query timers
  const { timers, isLoadingTimers: isLoading } = useTimers(entity);

  const timersForEntity = timers;

  const handleCreate = React.useCallback(() => {
    setSelectedTimer(null);
    editorModal.present();
  }, [editorModal]);

  const handleEdit = (timer: TDeviceTimer) => {
    setSelectedTimer(timer);
    editorModal.present();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Animated.View entering={FadeInDown.duration(300)} className="items-center">
          <Text className="text-[17px] font-semibold text-[#1B1B1B] dark:text-white" numberOfLines={1}>
            {translate('automation.countdown.title')}
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
                name="timer-outline"
                size={16}
                color={isDark ? '#60A5FA' : '#3B82F6'}
              />
              <Text className="text-[13px] font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                {translate('automation.countdown.title')}
              </Text>
              <View className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900/40">
                <Text className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  {timersForEntity.length}
                </Text>
              </View>
            </View>

            {(isLoading && timersForEntity.length === 0)
              ? (
                  <View className="items-center justify-center py-10">
                    <ActivityIndicator color="#3B82F6" />
                  </View>
                )
              : (
                  <Animated.View
                    className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
                    layout={LinearTransition}
                  >
                    {timersForEntity.length > 0
                      ? (
                          timersForEntity.map((timer, idx) => {
                            const targetAction = timer.actions?.[0]?.value as number | string;
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

                            const execDate = new Date(timer.executeAt);
                            const timeFormatted = `${execDate.getHours().toString().padStart(2, '0')}:${execDate.getMinutes().toString().padStart(2, '0')}`;
                            const dateFormatted = execDate.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });

                            return (
                              <Animated.View key={timer.id} layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
                                <TouchableOpacity
                                  className="flex-row items-center justify-between p-4"
                                  activeOpacity={0.7}
                                  onPress={() => handleEdit(timer)}
                                >
                                  <View className="flex-1">
                                    <View className="mb-1 flex-row items-center gap-2">
                                      <Text className="text-2xl font-bold text-[#1B1B1B] dark:text-white">
                                        {timeFormatted}
                                      </Text>
                                      <View className={`rounded-sm px-1.5 py-0.5 ${(isActionOn || targetAction === 'OPEN') ? 'bg-[#A3E635]/20' : (targetAction === 'STOP' ? 'bg-amber-400/20' : 'bg-neutral-200 dark:bg-neutral-700')}`}>
                                        <Text className={`text-[10px] font-bold ${(isActionOn || targetAction === 'OPEN') ? 'text-[#1B1B1B] dark:text-[#A3E635]' : (targetAction === 'STOP' ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-300')}`}>
                                          {actionText}
                                        </Text>
                                      </View>
                                    </View>
                                    <Text className="text-[11px] font-medium text-neutral-500">
                                      {translate('base.date')}
                                      {' '}
                                      {dateFormatted}
                                    </Text>
                                  </View>
                                  <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#525252' : '#D4D4D4'} />
                                </TouchableOpacity>
                                {idx < timersForEntity.length - 1 && (
                                  <View className="mx-4 h-px bg-neutral-100 dark:bg-neutral-700" />
                                )}
                              </Animated.View>
                            );
                          })
                        )
                      : (
                          <View className="items-center justify-center p-8">
                            <MaterialCommunityIcons name="timer-off-outline" size={32} color={isDark ? '#525252' : '#D4D4D4'} />
                            <Text className="mt-3 text-center text-sm font-medium text-neutral-500">
                              {translate('automation.countdown.noTimers')}
                            </Text>
                            <Text className="mt-1 text-center text-xs text-neutral-400">
                              {translate('automation.countdown.tapToAdd')}
                            </Text>
                          </View>
                        )}
                  </Animated.View>
                )}
          </View>
        </ScrollView>

        {/* Editor Sheet */}
        {device && entity && (
          <CountdownEditorSheet
            modalRef={editorModal.ref}
            device={device}
            entity={entity}
            existingTimer={selectedTimer}
            onSuccess={() => {
            // Refetch automatically handled by react-query via invalidate
            }}
          />
        )}
      </View>
    </BottomSheetModalProvider>
  );
}
