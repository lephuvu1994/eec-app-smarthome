import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View } from '@/components/ui';
import { DeviceActionBar } from '@/features/devices/common/components/device-action-bar';
import { useClimateControl } from '@/features/devices/types/climate/hooks/use-climate-control';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';

type Props = {
  deviceId: string;
  entityId?: string;
};

const MODE_ICONS: Record<string, string> = {
  cool: 'snowflake',
  heat: 'sun',
  dry: 'tint',
  fan: 'wind',
  auto: 'magic',
};

const MODE_COLORS: Record<string, string> = {
  cool: '#3B82F6', // blue-500
  heat: '#EF4444', // red-500
  dry: '#10B981', // emerald-500
  fan: '#8B5CF6', // violet-500
  auto: '#F59E0B', // amber-500
};

export function ClimateDetailScreen({ deviceId, entityId }: Props) {
  const router = useRouter();
  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;

  const primaryEntity = entityId
    ? device?.entities.find(e => e.id === entityId)
    : device ? getPrimaryEntities(device)[0] : undefined;

  const {
    isOn,
    isLoading,
    targetTemp,
    currentTemp,
    mode,
    handleToggle,
    handleIncreaseTemp,
    handleDecreaseTemp,
  } = useClimateControl(device as any, primaryEntity as any);

  // Background smooth color transition
  const activeColor = MODE_COLORS[mode] || MODE_COLORS.cool;

  const powerProgress = useDerivedValue(() => {
    return withTiming(isOn ? 1 : 0, { duration: 500 });
  });

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      powerProgress.value,
      [0, 1],
      ['#1E1E1E', activeColor], // Dark grey to bright mode color
    ),
  }));

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
            <FontAwesome name="chevron-left" size={18} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold tracking-wide text-white">
            {device.name}
          </Text>
          <View className="h-11 w-11" />
        </View>

        <ScrollView className="mt-4 flex-1 px-4" showsVerticalScrollIndicator={false}>

          {/* Main Ring Area */}
          <View className="items-center py-10">
            <View className="relative size-72 items-center justify-center rounded-full border-8 border-white/20">
              <Text className="mb-1 text-lg font-medium text-white/60">
                {translate('deviceDetail.climate.currentTemp' as any, { defaultValue: 'Room Temp' })}
                :
                {currentTemp}
                °
              </Text>
              <Text className="mb-4 text-8xl font-black tracking-tighter text-white shadow-sm">
                {targetTemp}
                °
              </Text>

              <Text className="text-sm font-bold tracking-widest text-white/80 uppercase">
                {translate(`deviceDetail.climate.modes.${mode}` as any, { defaultValue: mode })}
              </Text>

              {/* Steppers */}
              <View className="absolute bottom-5 -mb-8 w-full flex-row items-center justify-between pr-10 pl-10">
                <TouchableOpacity
                  className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm"
                  onPress={handleDecreaseTemp}
                  disabled={!isOn}
                >
                  <FontAwesome5 name="minus" size={24} color={activeColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm"
                  onPress={handleIncreaseTemp}
                  disabled={!isOn}
                >
                  <FontAwesome5 name="plus" size={24} color={activeColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Controls Container */}
          <View className="mt-16 mb-8 rounded-3xl bg-white/10 p-5">
            <View className="flex-row items-center justify-between">

              {/* Modes */}
              <View className="flex-1 flex-row justify-around pr-4">
                {Object.keys(MODE_ICONS).map(k => (
                  <TouchableOpacity
                    key={k}
                    className={`size-12 items-center justify-center rounded-full ${mode === k && isOn ? 'bg-white' : 'bg-transparent'}`}
                    disabled={!isOn}
                  >
                    <FontAwesome5
                      name={MODE_ICONS[k]}
                      size={20}
                      color={mode === k && isOn ? activeColor : '#fff'}
                      solid={mode === k}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Power Button */}
              <View className="border-l border-white/20 pl-4">
                <TouchableOpacity
                  className={`flex size-[68px] items-center justify-center rounded-full shadow-lg ${isOn ? 'bg-white' : 'bg-neutral-800'}`}
                  onPress={handleToggle}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <FontAwesome5 name="power-off" size={26} color={isOn ? activeColor : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        <DeviceActionBar device={device} entities={primaryEntity ? [primaryEntity] : []} />
      </SafeAreaView>
    </Animated.View>
  );
}
