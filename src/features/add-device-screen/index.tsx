import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Svg, Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { Stack } from 'expo-router';

enum EAddDeviceStep {
  SEARCH = 0,
  RESULTS = 1,
  ROOM_ASSIGN = 2,
}

type DeviceResult = {
  id: string;
  name: string;
  status: 'connecting' | 'connected' | 'failed';
  image: any;
  angle: number; // in degrees
  radius: number; // radius from center
};

const RADAR_SIZE = 280;
const CENTER = RADAR_SIZE / 2;
const LIME_GREEN = '#A3E635';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function AddDeviceScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const [step, setStep] = useState<EAddDeviceStep>(EAddDeviceStep.SEARCH);

  // Rotation for the radar beam
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Mock data for step 2
  const [devices] = useState<DeviceResult[]>([
    { id: '1', name: 'Amazon Alexa 2', status: 'failed', image: null, angle: 45, radius: 0.7 },
    { id: '2', name: 'Tapo TP-Link C210 360', status: 'connected', image: null, angle: 160, radius: 0.5 },
    { id: '3', name: 'Havells Glamax 9W B22', status: 'connected', image: null, angle: 280, radius: 0.8 },
  ]);

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const renderRadar = () => (
    <View className="relative items-center justify-center" style={{ width: RADAR_SIZE, height: RADAR_SIZE }}>
      {/* Background Rings */}
      <View className="absolute inset-0 items-center justify-center">
        <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
          {[0.3, 0.6, 0.9].map((scale, i) => (
            <Circle
              key={i}
              cx={CENTER}
              cy={CENTER}
              r={(RADAR_SIZE / 2) * scale}
              stroke={LIME_GREEN}
              strokeWidth="1"
              opacity={0.15}
              fill="none"
            />
          ))}
        </Svg>
      </View>

      {/* Rotating Beam */}
      <Animated.View style={[beamStyle, { position: 'absolute', width: RADAR_SIZE, height: RADAR_SIZE }]}>
        <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
          <Defs>
            <RadialGradient id="beamGrad" cx={CENTER} cy={CENTER} r={RADAR_SIZE / 2} fx={CENTER} fy={CENTER} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={LIME_GREEN} stopOpacity="0.4" />
              <Stop offset="1" stopColor={LIME_GREEN} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Path
            d={`M ${CENTER} ${CENTER} L ${CENTER} 0 A ${RADAR_SIZE / 2} ${RADAR_SIZE / 2} 0 0 1 ${CENTER + RADAR_SIZE / 2} ${CENTER} Z`}
            fill="url(#beamGrad)"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>

      {/* Centered Image (Optional base) */}
      <Image
        source={require('@@/assets/base/radar-scanner.png')}
        style={{ width: RADAR_SIZE, height: RADAR_SIZE, position: 'absolute', opacity: 0.2 }}
        contentFit="contain"
      />

      {/* Device Icons floating on Radar */}
      {devices.map((device, idx) => {
        const rad = (device.angle * Math.PI) / 180;
        const x = CENTER + (RADAR_SIZE / 2) * device.radius * Math.cos(rad);
        const y = CENTER + (RADAR_SIZE / 2) * device.radius * Math.sin(rad);

        // Reactivity to beam: calculate distance between rotation angle and device angle
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const iconStyle = useAnimatedStyle(() => {
          const diff = Math.abs((rotation.value % 360) - device.angle);
          const isScanning = diff < 30 || diff > 330;
          const scale = interpolate(isScanning ? 1 : 0, [0, 1], [1, 1.3]);
          const opacity = interpolate(isScanning ? 1 : 0, [0, 1], [0.3, 1]);
          return {
            transform: [{ scale: withTiming(scale, { duration: 150 }) }],
            opacity: withTiming(opacity, { duration: 150 }),
          };
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const popInStyle = useAnimatedStyle(() => ({
            transform: [{ scale: withDelay(idx * 800, withSequence(withTiming(1.2), withTiming(1)))}],
            opacity: withDelay(idx * 800, withTiming(1)),
        }));

        return (
          <Animated.View
            key={device.id}
            style={[
              {
                position: 'absolute',
                left: x - 20,
                top: y - 20,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                opacity: 0,
              },
              popInStyle,
              iconStyle,
            ]}
          >
            <MaterialCommunityIcons 
              name={device.name.toLowerCase().includes('camera') ? 'camera-outline' : 'devices'} 
              size={20} 
              color={LIME_GREEN} 
            />
          </Animated.View>
        );
      })}

      {/* Center Axis */}
      <View className="size-4 items-center justify-center rounded-full bg-white shadow-sm">
        <View className="size-2 rounded-full bg-[#A3E635]" />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View className="flex-1 items-center justify-between px-6 pb-10">
      <View className="flex-1 items-center justify-center pt-10">
        {renderRadar()}

        <View className="mt-12 items-center px-4">
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white text-center">
            {translate('base.searchDevice') || 'Tìm kiếm thiết bị'}
          </Text>
          <Text className="mt-3 text-center text-sm text-neutral-500 dark:text-neutral-400 leading-5">
            {translate('base.searchDeviceDesc') || 'Cho phép chúng tôi kiểm tra các thiết bị ở gần bằng Bluetooth hoặc Wi-Fi.'}
          </Text>
        </View>
      </View>

      <View className="w-full gap-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setStep(EAddDeviceStep.RESULTS)}
          className="h-14 w-full items-center justify-center rounded-2xl bg-[#A3E635]"
        >
          <Text className="text-base font-bold text-neutral-900">
            {translate('base.allowAndContinue') || 'Cho phép và Tiếp tục'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="h-14 w-full items-center justify-center rounded-2xl bg-white/60 dark:bg-neutral-800"
        >
          <Text className="text-base font-medium text-neutral-600 dark:text-neutral-300">
            {translate('base.addManually') || 'Thêm thủ công'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1 px-6 pb-10">
      <View className="flex-1 pt-6">
        <Text className="text-xl font-bold text-neutral-800 dark:text-white">
          {translate('base.foundDevices', { count: devices.filter(d => d.status === 'connected').length }) || `Đã tìm thấy ${devices.length} thiết bị`}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
          {devices.map((device) => (
            <View
              key={device.id}
              className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800"
            >
              <View className="size-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
                <MaterialCommunityIcons 
                  name={device.name.toLowerCase().includes('camera') ? 'camera-outline' : 'devices'} 
                  size={24} 
                  color="#737373" 
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-[15px] font-bold text-neutral-800 dark:text-white">{device.name}</Text>
                <Text 
                  className={`text-xs mt-0.5 ${
                    device.status === 'connected' ? 'text-green-500' : 
                    device.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                  }`}
                >
                  {device.status === 'connected' ? 'Connected' : device.status === 'failed' ? 'Unable to connect' : 'Connecting...'}
                </Text>
              </View>
              {device.status === 'connected' ? (
                <View className="size-6 items-center justify-center rounded-full bg-green-100">
                  <MaterialCommunityIcons name="check" size={16} color="#22C55E" />
                </View>
              ) : device.status === 'failed' ? (
                <TouchableOpacity className="size-8 items-center justify-center rounded-full bg-red-50">
                  <MaterialCommunityIcons name="refresh" size={18} color="#EF4444" />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setStep(EAddDeviceStep.ROOM_ASSIGN)}
        className="h-14 w-full items-center justify-center rounded-2xl bg-[#A3E635]"
      >
        <Text className="text-base font-bold text-neutral-900">
          {translate('base.continue') || 'Tiếp tục'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1 px-6 pb-10">
      <View className="flex-1 pt-6">
        <Text className="text-xl font-bold text-neutral-800 dark:text-white">
          {translate('base.manageRoomAndDevice') || 'Quản lý phòng & thiết bị'}
        </Text>

        <View className="mt-8">
          <Text className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
            {translate('base.selectRoom') || 'CHỌN PHÒNG'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -ml-2">
            {[
              { label: 'Phòng bếp', icon: 'silverware-fork-knife' },
              { label: 'Phòng khách', icon: 'sofa' },
              { label: 'Phòng ngủ', icon: 'bed' },
            ].map((room, idx) => (
              <TouchableOpacity
                key={room.label}
                className={`ml-2 flex-row items-center rounded-full px-4 py-2 ${
                  idx === 1 ? 'bg-[#A3E635]' : 'bg-white dark:bg-neutral-800'
                }`}
              >
                <MaterialCommunityIcons 
                  name={room.icon as any} 
                  size={16} 
                  color={idx === 1 ? '#1B1B1B' : '#737373'} 
                />
                <Text className={`ml-2 text-sm font-medium ${idx === 1 ? 'text-neutral-900' : 'text-neutral-600 dark:text-neutral-300'}`}>
                  {room.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity className="ml-2 flex-row items-center rounded-full bg-neutral-100 px-4 py-2 dark:bg-neutral-800">
              <MaterialCommunityIcons name="plus" size={16} color="#737373" />
              <Text className="ml-1 text-sm font-medium text-neutral-600 dark:text-neutral-300">Thêm phòng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="mt-10">
          <Text className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
            {translate('base.devices') || 'THIẾT BỊ'}
          </Text>
          <View className="mt-4">
             {devices.filter(d => d.status === 'connected').map(device => (
               <View key={device.id} className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
                 <View className="size-10 items-center justify-center rounded-xl bg-neutral-50 dark:bg-neutral-700">
                   <MaterialCommunityIcons 
                     name={device.name.toLowerCase().includes('camera') ? 'camera-outline' : 'devices'} 
                     size={20} 
                     color="#737373" 
                   />
                 </View>
                 <Text className="ml-4 flex-1 text-[15px] font-bold text-neutral-800 dark:text-white">{device.name}</Text>
               </View>
             ))}
          </View>
        </View>
      </View>

      <View className="items-center pb-6">
        <Text className="text-sm text-neutral-500">
          Bạn còn thiếu thiết bị nào không? <Text className="font-bold text-[#A3E635]">Thêm ngay</Text>
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {/* Finalize */}}
        className="h-14 w-full items-center justify-center rounded-2xl bg-[#A3E635]"
      >
        <Text className="text-base font-bold text-neutral-900">
          {translate('base.finish') || 'Hoàn tất'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseLayout>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="relative w-full flex-1">
        <Image
          source={
            theme === ETheme.Dark
              ? require('@@/assets/base/background-dark.png')
              : require('@@/assets/base/background-light.png')
          }
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          contentFit="contain"
        />

        <View style={{ paddingTop: insets.top, flex: 1 }}>
          {/* Custom Header */}
          <View className="h-14 flex-row items-center px-4">
            <TouchableOpacity onPress={() => {/* navigation handle */ }}>
              <MaterialCommunityIcons name="chevron-left" size={32} color={theme === ETheme.Dark ? '#fff' : '#1B1B1B'} />
            </TouchableOpacity>
            <Text className="ml-1 text-lg font-bold text-neutral-900 dark:text-white">
              {translate('base.addDevice') || 'Thêm thiết bị'}
            </Text>
          </View>

          {step === EAddDeviceStep.SEARCH && renderStep1()}
          {step === EAddDeviceStep.RESULTS && renderStep2()}
          {step === EAddDeviceStep.ROOM_ASSIGN && renderStep3()}
        </View>
      </View>
    </BaseLayout>
  );
}