import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { PRIMARY_GREEN_HEX } from '../constants';
import { EPairingMode } from '../types';

export function LedConfirm({
  onSelect,
}: {
  onSelect: (mode: EPairingMode) => void;
}) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  // LED animation - fast blink
  const fastOpacity = useSharedValue(1);
  // LED animation - slow blink
  const slowOpacity = useSharedValue(1);

  useEffect(() => {
    fastOpacity.value = withRepeat(
      withTiming(0.2, { duration: 300, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    slowOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [fastOpacity, slowOpacity]);

  return (
    <View className="flex-1 px-5 pt-8">
      <Text className="text-center text-2xl font-bold text-[#1A1A1A] dark:text-white">
        {translate('base.confirmLedTitle')}
      </Text>
      <Text className="mt-3 text-center text-[15px] text-[#666666] dark:text-neutral-400">
        {translate('base.confirmLedDesc')}
      </Text>

      <View className="mt-10 gap-y-4">
        {/* BLE Mode — Fast blink */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect(EPairingMode.BLE)}
          className="flex-row items-center rounded-2xl bg-white p-5 dark:bg-neutral-800"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
            <Animated.View style={{ opacity: fastOpacity }}>
              <MaterialCommunityIcons name="led-on" size={32} color={PRIMARY_GREEN_HEX} />
            </Animated.View>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[16px] font-bold text-[#1A1A1A] dark:text-white">
              {translate('base.ledFastBlink')}
            </Text>
            <Text className="mt-1 text-[13px] text-[#666666] dark:text-neutral-400">
              {translate('base.ledFastBlinkDesc')}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#9CA3AF' : '#D1D5DB'} />
        </TouchableOpacity>

        {/* AP Mode — Slow blink */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect(EPairingMode.AP)}
          className="flex-row items-center rounded-2xl bg-white p-5 dark:bg-neutral-800"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="size-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30">
            <Animated.View style={{ opacity: slowOpacity }}>
              <MaterialCommunityIcons name="led-on" size={32} color="#3B82F6" />
            </Animated.View>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[16px] font-bold text-[#1A1A1A] dark:text-white">
              {translate('base.ledSlowBlink')}
            </Text>
            <Text className="mt-1 text-[13px] text-[#666666] dark:text-neutral-400">
              {translate('base.ledSlowBlinkDesc')}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#9CA3AF' : '#D1D5DB'} />
        </TouchableOpacity>
      </View>

      {/* Help link */}
      <TouchableOpacity className="mt-8 items-center" activeOpacity={0.7}>
        <Text className="text-[14px] font-medium text-[#666666] underline dark:text-neutral-400">
          {translate('base.ledNotBlinking')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
