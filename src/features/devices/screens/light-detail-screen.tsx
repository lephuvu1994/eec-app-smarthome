import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, TouchableOpacity, View, WIDTH } from '@/components/ui';
import { PowerIcon } from '@/components/ui/icons/power-icon';
import { useLightControl } from '@/features/devices/hooks/use-light-control';
import { getDeviceImage } from '@/features/home-screen/utils/device-image';
import { EDeviceStatus } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';

type Props = {
  deviceId: string;
  entityId?: string;
};

const SLIDER_WIDTH = WIDTH - 64; // 32px padding left + right
const SLIDER_HEIGHT = 8;
const KNOB_SIZE = 28;
const MAX_TRANSLATE_X = SLIDER_WIDTH - KNOB_SIZE;

// Rainbow gradient for color temperature
const GRADIENT_COLORS = [
  '#FF8A00',
  '#FFD21E',
  '#7BFF00',
  '#00E5FF',
  '#006BFF',
  '#8B00FF',
  '#FF006B',
] as const;

export function LightDetailScreen({ deviceId, entityId }: Props) {
  const router = useRouter();
  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;

  const primaryEntity = entityId
    ? device?.entities.find(e => e.id === entityId)
    : device ? getPrimaryEntities(device)[0] : undefined;

  const { isOn, isLoading, brightness, handleToggle, handleChangeBrightness } = useLightControl(device as any, primaryEntity as any);

  const isOnline = device?.status === EDeviceStatus.ONLINE;
  const statusText = isOnline ? 'Connected' : 'Offline';

  // Power Button Animation
  const powerProgress = useDerivedValue(() => {
    return withTiming(isOn ? 1 : 0, { duration: 300 });
  });

  const powerButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(powerProgress.value, [0, 1], ['#E9ECF4', '#1A1A1A']),
  }));

  const powerIconAnimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOn ? 1 : 0.5, { duration: 300 }),
  }));

  // Glow effect animation
  const glowStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isOn ? 0.65 : 0, { duration: 500 }),
    transform: [{ scale: withTiming(isOn ? 1 : 0.8, { duration: 500 }) }],
  }));

  // Slider State
  const sliderProgress = useSharedValue(brightness / 100);

  useEffect(() => {
    sliderProgress.value = withSpring(brightness / 100);
  }, [brightness, sliderProgress]);

  const commitChange = (val: number) => {
    handleChangeBrightness(Math.round(val * 100));
  };

  const sliderOffset = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      sliderOffset.value = sliderProgress.value * MAX_TRANSLATE_X;
    })
    .onUpdate((e) => {
      let nextX = sliderOffset.value + e.translationX;
      nextX = Math.max(0, Math.min(MAX_TRANSLATE_X, nextX));
      sliderProgress.value = nextX / MAX_TRANSLATE_X;
    })
    .onEnd(() => {
      runOnJS(commitChange)(sliderProgress.value);
    });

  const animatedKnobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderProgress.value * MAX_TRANSLATE_X }],
  }));

  if (!device || !primaryEntity) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F5F5F7] dark:bg-black">
        <Text className="text-neutral-900 dark:text-white">{translate('base.somethingWentWrong')}</Text>
      </SafeAreaView>
    );
  }

  const deviceImg = getDeviceImage(device.type || 'light');

  return (
    <View className="flex-1 bg-[#F5F5F7] dark:bg-[#0A0A0A]">
      <SafeAreaView className="flex-1">

        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="size-11 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800"
          >
            <FontAwesome name="chevron-left" size={16} color="#1A1A1A" />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-neutral-900 dark:text-white">
            Đèn
          </Text>

          <TouchableOpacity className="size-11 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800">
            <FontAwesome name="cog" size={16} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* ── Main Content ── */}
        <View className="flex-1 px-5 pt-2 pb-4">

          {/* Device Status Card */}
          <View
            className="flex-row items-center rounded-2xl bg-white p-4 dark:bg-neutral-900"
            style={styles.cardShadow}
          >
            <View className="mr-3 size-11 items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-neutral-800">
              <FontAwesome5 name="lightbulb" size={18} color={isOn ? '#FFD21E' : '#B0B0B0'} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-neutral-900 dark:text-white" numberOfLines={1}>
                {device.name}
              </Text>
              <View className="mt-0.5 flex-row items-center">
                <View
                  className="mr-1.5 size-2 rounded-full"
                  style={{ backgroundColor: isOnline ? '#34C759' : '#B0B0B0' }}
                />
                <Text className="text-xs text-neutral-500">{statusText}</Text>
              </View>
            </View>
          </View>

          {/* Device Image with Glow */}
          <View className="flex-1 items-center justify-center">
            {/* Warm yellow glow behind the image */}
            <Animated.View style={[styles.glowContainer, glowStyle]}>
              <View style={styles.glowOuter} />
              <View style={styles.glowInner} />
            </Animated.View>
            <Image source={deviceImg} style={{ width: 200, height: 200 }} contentFit="contain" />
          </View>

          {/* ── Controls ── */}
          <View className="items-center gap-8">

            {/* Power Button */}
            <TouchableOpacity
              onPress={handleToggle}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View className="items-center justify-center rounded-full bg-white p-1.5 shadow-sm dark:bg-neutral-800">
                <Animated.View
                  style={[styles.powerButton, powerButtonStyle]}
                >
                  <Animated.View style={powerIconAnimStyle}>
                    <PowerIcon color="#FFFFFF" size={26} />
                  </Animated.View>
                </Animated.View>
              </View>
            </TouchableOpacity>

            {/* Color Temperature Slider */}
            <View className="w-full gap-3 px-3">
              <View style={{ height: KNOB_SIZE + 8, justifyContent: 'center' }}>
                <GestureDetector gesture={panGesture}>
                  <View style={{ width: '100%', height: KNOB_SIZE + 8, justifyContent: 'center' }}>
                    {/* Gradient Track */}
                    <View style={styles.trackContainer}>
                      <LinearGradient
                        colors={[...GRADIENT_COLORS]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.gradientTrack}
                      />
                    </View>

                    {/* Knob */}
                    <Animated.View style={[styles.knob, animatedKnobStyle]}>
                      <View style={styles.knobInner} />
                    </Animated.View>
                  </View>
                </GestureDetector>
              </View>

              <View className="flex-row justify-between px-1">
                <Text className="text-xs font-medium text-neutral-400">Warm</Text>
                <Text className="text-xs font-medium text-neutral-400">Cool</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Bottom Status Widgets ── */}
        <View className="flex-row gap-3 px-5 pb-5">
          <View
            className="flex-1 flex-row items-center rounded-2xl bg-white p-3.5 dark:bg-neutral-900"
            style={styles.cardShadow}
          >
            <View className="mr-3 size-10 items-center justify-center rounded-full bg-[#F5F5F7] dark:bg-neutral-800">
              <FontAwesome5 name="clock" size={14} color="#1A1A1A" />
            </View>
            <View>
              <Text className="text-[15px] font-bold text-neutral-900 dark:text-white">04 HR</Text>
              <Text className="mt-0.5 text-[11px] text-neutral-400">Đã chạy</Text>
            </View>
          </View>

          <View
            className="flex-1 flex-row items-center rounded-2xl bg-white p-3.5 dark:bg-neutral-900"
            style={styles.cardShadow}
          >
            <View className="mr-3 size-10 items-center justify-center rounded-full bg-[#F0FAF0] dark:bg-neutral-800">
              <FontAwesome5 name="leaf" size={14} color="#34C759" />
            </View>
            <View>
              <Text className="text-[15px] font-bold text-neutral-900 dark:text-white">72 AQI</Text>
              <Text className="mt-0.5 text-[11px] text-neutral-400">Trung bình</Text>
            </View>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  glowContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FFD21E',
    opacity: 0.25,
  },
  glowInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFD21E',
    opacity: 0.4,
  },
  powerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackContainer: {
    position: 'absolute',
    left: KNOB_SIZE / 2,
    right: KNOB_SIZE / 2,
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
    overflow: 'hidden',
  },
  gradientTrack: {
    flex: 1,
    borderRadius: SLIDER_HEIGHT / 2,
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FF8A00',
  },
  knobInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8A00',
  },
});
