import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderBackButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { colors, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { ESceneTriggerHubType } from './types/scene-trigger-hub';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type TTriggerItem = {
  id: string;
  type: ESceneTriggerHubType;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  desc: string;
  bgIconColor: string;
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const MANUAL_ITEMS: TTriggerItem[] = [
  {
    id: 'manual-1',
    type: ESceneTriggerHubType.Manual,
    icon: 'gesture-tap',
    title: translate('scenes.builder.triggerTapToRun'),
    desc: translate('scenes.builder.triggerTapToRunDesc'),
    bgIconColor: '#FDF2F8',
  },
];

const AUTO_ITEMS: TTriggerItem[] = [
  {
    id: 'auto-1',
    type: ESceneTriggerHubType.DeviceState,
    icon: 'devices',
    title: translate('scenes.builder.triggerDeviceState'),
    desc: translate('scenes.builder.triggerDeviceStateDesc'),
    bgIconColor: '#EFF6FF',
  },
  {
    id: 'auto-2',
    type: ESceneTriggerHubType.Schedule,
    icon: 'clock-outline',
    title: translate('scenes.builder.triggerSchedule'),
    desc: translate('scenes.builder.triggerScheduleDesc'),
    bgIconColor: '#FEFCE8',
  },
  {
    id: 'auto-3',
    type: ESceneTriggerHubType.Weather,
    icon: 'weather-partly-cloudy',
    title: translate('scenes.builder.triggerWeather'),
    desc: translate('scenes.builder.triggerWeatherDesc'),
    bgIconColor: '#F0FDF4',
  },
  {
    id: 'auto-4',
    type: ESceneTriggerHubType.Location,
    icon: 'map-marker-outline',
    title: translate('scenes.builder.triggerLocation'),
    desc: translate('scenes.builder.triggerLocationDesc'),
    bgIconColor: '#EEF2FF',
  },
  {
    id: 'auto-5',
    type: ESceneTriggerHubType.ArmMode,
    icon: 'shield-home-outline',
    title: translate('scenes.builder.triggerArmMode'),
    desc: translate('scenes.builder.triggerArmModeDesc'),
    bgIconColor: '#FFF1F2',
  },
  {
    id: 'auto-6',
    type: ESceneTriggerHubType.Alarm,
    icon: 'bell-ring-outline',
    title: translate('scenes.builder.triggerAlarm'),
    desc: translate('scenes.builder.triggerAlarmDesc'),
    bgIconColor: '#FFF7ED',
  },
  {
    id: 'auto-7',
    type: ESceneTriggerHubType.Disaster,
    icon: 'alert-decagram-outline',
    title: translate('scenes.builder.triggerDisaster'),
    desc: translate('scenes.builder.triggerDisasterDesc'),
    bgIconColor: '#FEF2F2',
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function SceneTriggerHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const handleSelectItem = useCallback((type: ESceneTriggerHubType) => {
    if (type === ESceneTriggerHubType.Manual) {
      router.push('/(app)/(mobile)/(scene)/tap-to-run-builder');
      return;
    }
    router.push({
      pathname: '/(app)/(mobile)/(scene)/builder',
      params: { triggerType: type },
    });
  }, [router]);

  const renderItem = useCallback(
    (item: TTriggerItem, index: number, total: number) => {
      const isLast = index === total - 1;
      return (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          onPress={() => handleSelectItem(item.type)}
          className={`flex-row items-center justify-between bg-white p-4 dark:bg-charcoal-900 ${
            !isLast ? 'border-b border-gray-100 dark:border-neutral-800' : ''
          }`}
        >
          <View className="flex-1 flex-row items-center">
            <View
              className="size-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: item.bgIconColor }}
            >
              <MaterialCommunityIcons name={item.icon} size={24} color={colors.primaryActive} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</Text>
              <Text className="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">{item.desc}</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
        </TouchableOpacity>
      );
    },
    [handleSelectItem],
  );

  return (
    <View className="flex-1 bg-[#F9FAFB] dark:bg-charcoal-950">
      <CustomHeader
        title={translate('scenes.builder.hubCreateTitle')}
        leftContent={<HeaderBackButton onPress={() => router.back()} />}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: headerOffset,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-charcoal-900">
          {MANUAL_ITEMS.map((item, index, arr) =>
            renderItem(item, index, arr.length),
          )}
        </View>
        <View className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-charcoal-900">
          {AUTO_ITEMS.map((item, index, arr) =>
            renderItem(item, index, arr.length),
          )}
        </View>
      </ScrollView>

      {/* Footer Floating Nút */}
      <Animated.View
        entering={FadeInUp.duration(300)}
        className="absolute inset-x-0 bottom-0 border-t border-neutral-200 bg-white px-4 shadow-lg dark:border-[#292929] dark:bg-[#1B1B1B]"
        style={{ paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 items-center gap-1.5"
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View className="h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white shadow-sm dark:border dark:border-[#292929] dark:bg-[#FFFFFF12]">
              <MaterialCommunityIcons name="layers-outline" size={20} color={isDark ? '#fff' : '#1B1B1B'} />
              <Text className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
                {translate('scenes.builder.createFromTemplate')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center gap-1.5"
            onPress={() => handleSelectItem(ESceneTriggerHubType.Advanced)}
            activeOpacity={0.7}
          >
            <View className="h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] shadow-sm dark:border dark:border-[#292929]">
              <MaterialCommunityIcons name="magic-staff" size={20} color="#FFFFFF" />
              <Text className="text-[10px] font-medium text-white" numberOfLines={1}>
                {translate('scenes.builder.advanced')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
