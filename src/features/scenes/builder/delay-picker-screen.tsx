import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderBackButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, View, WheelPicker } from '@/components/ui';
import { useSceneBuilderStore } from '@/features/scenes/builder/stores/scene-builder-store';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOURS_DATA = Array.from({ length: 24 }, (_, i) => i);
const MM_SS_DATA = Array.from({ length: 60 }, (_, i) => i);

// ─── Component ───────────────────────────────────────────────────────────────

export function DelayPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const setPendingDelayMs = useSceneBuilderStore(s => s.setPendingDelayMs);

  // Refs track the actual selected values — avoids re-render from onValueChange
  // which would cause QWheelPicker to re-animate and disrupt ongoing scroll.
  const hoursRef = useRef(0);
  const minutesRef = useRef(0);
  const secondsRef = useRef(5);

  // Separate summary state — only updates on settle, purely for display
  const [summary, setSummary] = useState({ h: 0, m: 0, s: 5 });

  const handleConfirm = useCallback(() => {
    const { h, m, s } = summary;
    const totalMs = (h * 3600 + m * 60 + s) * 1000;
    setPendingDelayMs(totalMs > 0 ? totalMs : 1000);
    router.back();
  }, [summary, setPendingDelayMs, router]);

  const summaryStr = [
    summary.h > 0 ? `${summary.h}h` : '',
    summary.m > 0 ? `${summary.m}m` : '',
    summary.s > 0 ? `${summary.s}s` : '',
  ].filter(Boolean).join(' ') || '0s';

  return (
    <BaseLayout>
      <CustomHeader
        title={translate('scenes.builder.actionTypeDelay')}
        tintColor={isDark ? '#FFFFFF' : '#1B1B1B'}
        leftContent={<HeaderBackButton onPress={() => router.back()} color={isDark ? '#FFFFFF' : '#1B1B1B'} />}
        rightContent={(
          <TouchableOpacity onPress={handleConfirm} className="px-1">
            <Text className="text-primary text-[16px] font-semibold">
              {translate('base.confirmButton')}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View
        className="flex-1 items-center justify-center"
        style={{ paddingTop: headerOffset, paddingBottom: insets.bottom + 24 }}
      >
        {/* Description */}
        <Text className="mb-8 px-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {translate('scenes.builder.delayPickerDesc')}
        </Text>

        {/* 3-column WheelPicker — uncontrolled (no value prop) to avoid scroll interruption */}
        <View className="flex-row items-center justify-center gap-6">
          {/* Hours */}
          <View className="items-center">
            <WheelPicker
              data={HOURS_DATA}
              value={hoursRef.current}
              onValueChange={(h) => {
                console.log('WheelPicker [HOURS] changed to:', h);
                hoursRef.current = h;
                setSummary(prev => ({ ...prev, h }));
              }}
              formatLabel={val => val.toString().padStart(2, '0')}
            />
            <Text className="mt-2 text-xs font-semibold text-neutral-500 uppercase">
              {translate('automation.countdown.hours')}
            </Text>
          </View>

          <Text className="pb-6 text-2xl font-bold dark:text-white">:</Text>

          {/* Minutes */}
          <View className="items-center">
            <WheelPicker
              data={MM_SS_DATA}
              value={minutesRef.current}
              onValueChange={(m) => {
                console.log('WheelPicker [MINUTES] changed to:', m);
                minutesRef.current = m;
                setSummary(prev => ({ ...prev, m }));
              }}
              formatLabel={val => val.toString().padStart(2, '0')}
            />
            <Text className="mt-2 text-xs font-semibold text-neutral-500 uppercase">
              {translate('automation.countdown.minutes')}
            </Text>
          </View>

          <Text className="pb-6 text-2xl font-bold dark:text-white">:</Text>

          {/* Seconds */}
          <View className="items-center">
            <WheelPicker
              data={MM_SS_DATA}
              value={secondsRef.current}
              onValueChange={(s) => {
                console.log('WheelPicker [SECONDS] changed to:', s);
                secondsRef.current = s;
                setSummary(prev => ({ ...prev, s }));
              }}
              formatLabel={val => val.toString().padStart(2, '0')}
            />
            <Text className="mt-2 text-xs font-semibold text-neutral-500 uppercase">
              {translate('automation.countdown.seconds')}
            </Text>
          </View>
        </View>

        {/* Summary — updates on settle */}
        <Text className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {summaryStr}
        </Text>
      </View>
    </BaseLayout>
  );
}
