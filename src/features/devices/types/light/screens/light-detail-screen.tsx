import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runOnJS } from 'react-native-worklets';

import { Text, View } from '@/components/ui';
import { DeviceActionBar } from '@/features/devices/common/components/device-action-bar';
import { useLightControl } from '@/features/devices/types/light/hooks/use-light-control';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';

type Props = {
  deviceId: string;
  entityId?: string;
};

const SLIDER_HEIGHT = 280;
const SLIDER_WIDTH = 100;

export function LightDetailScreen({ deviceId, entityId }: Props) {
  const router = useRouter();
  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;

  const primaryEntity = entityId
    ? device?.entities.find(e => e.id === entityId)
    : device ? getPrimaryEntities(device)[0] : undefined;

  const { isOn, isLoading, brightness, handleToggle, handleChangeBrightness } = useLightControl(device as any, primaryEntity as any);

  // Background and slider animations
  const powerProgress = useDerivedValue(() => {
    return withTiming(isOn ? 1 : 0, { duration: 500 });
  });

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      powerProgress.value,
      [0, 1],
      ['#121212', '#FEF08A'], // from neutral-900 to yellow-200
    ),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      powerProgress.value,
      [0, 1],
      ['#FFFFFF', '#1F2937'], // white when dark, gray-800 when light
    ),
  }));

  // Slider State
  const sliderProgress = useSharedValue(brightness / 100);

  useEffect(() => {
    // Sync slider when external brightness changes
    sliderProgress.value = withSpring(brightness / 100);
  }, [brightness, sliderProgress]);

  const [tempBright, setTempBright] = useState(brightness);

  const updateUI = (val: number) => {
    setTempBright(Math.round(val * 100));
  };

  const commitChange = (val: number) => {
    handleChangeBrightness(Math.round(val * 100));
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // e.y is from top to bottom (0 to SLIDER_HEIGHT)
      let nextPos = 1 - (e.y / SLIDER_HEIGHT);
      nextPos = Math.max(0, Math.min(1, nextPos));
      sliderProgress.value = nextPos;
      runOnJS(updateUI)(nextPos);
    })
    .onEnd(() => {
      runOnJS(commitChange)(sliderProgress.value);
    });

  const animatedSliderFillStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(sliderProgress.value, [0, 1], [0, SLIDER_HEIGHT], Extrapolation.CLAMP),
    };
  });

  if (!device || !primaryEntity) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">{translate('base.somethingWentWrong')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[animatedBgStyle]} className="flex-1">
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white/20"
          >
            <Animated.Text style={animatedTextStyle}>
              <FontAwesome name="chevron-left" size={18} color="inherit" />
            </Animated.Text>
          </TouchableOpacity>
          <Animated.Text style={animatedTextStyle} className="text-xl font-bold tracking-wide">
            {device.name}
          </Animated.Text>
          <View className="h-11 w-11" />
          {' '}
          {/* Placeholder for balance */}
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center pt-8">

          <Animated.Text style={animatedTextStyle} className="mb-2 text-6xl font-bold tracking-tighter">
            {isOn ? `${tempBright}%` : translate('base.off')}
          </Animated.Text>
          <Animated.Text style={animatedTextStyle} className="mb-12 text-lg font-medium opacity-70">
            {translate('deviceDetail.light.brightness', { defaultValue: 'Brightness' })}
          </Animated.Text>

          {/* Vertical Slider */}
          <GestureDetector gesture={panGesture}>
            <View
              className="justify-end overflow-hidden rounded-[50px] bg-white/20"
              style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT }}
            >
              <Animated.View
                className="w-full items-center bg-white pt-4 shadow-lg"
                style={animatedSliderFillStyle}
              >
                <View className="h-1.5 w-12 rounded-full bg-black/20" />
              </Animated.View>
            </View>
          </GestureDetector>

        </View>

        {/* Bottom Controls */}
        <View className="mt-auto mb-12 items-center">
          <TouchableOpacity
            className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg ${isOn ? 'bg-white' : 'bg-neutral-800'}`}
            onPress={handleToggle}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <FontAwesome5 name="power-off" size={28} color={isOn ? '#FBBF24' : '#fff'} />
          </TouchableOpacity>
        </View>

        <DeviceActionBar device={device} entities={primaryEntity ? [primaryEntity] : []} />
      </SafeAreaView>
    </Animated.View>
  );
}
