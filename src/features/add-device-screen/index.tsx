import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Canvas,
  Circle as SkiaCircle,
  LinearGradient as SkiaLinearGradient,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

enum EAddDeviceStep {
  SEARCH = 0,
  RESULTS = 1,
  ROOM_ASSIGN = 2,
}

type DeviceResult = {
  id: string;
  name: string;
  status: 'connecting' | 'connected' | 'failed';
  imageUrl: string;
  angle: number; // Góc xuất hiện trên radar (độ)
  radius: number; // Khoảng cách từ tâm (0.1 -> 1)
};

const RADAR_SIZE = 340;
const CENTER = RADAR_SIZE / 2;

// Định nghĩa mã màu chuẩn xanh lá từ CSS (A3EC3E -> rgba(163, 236, 62, X))
const PRIMARY_GREEN_HEX = '#A3EC3E';
const HIGHLIGHT_COLOR = '#8B5CF6'; // Màu tím bo viền Figma
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#666666';

// Component con xử lý icon thiết bị để ăn Animation chuẩn xác
function RadarDeviceIcon({
  device,
  currentBeamRotation,
}: {
  device: DeviceResult;
  currentBeamRotation: number;
}) {
  const rad = (device.angle * Math.PI) / 180;
  const activeRadius = RADAR_SIZE * 0.45;
  const x = CENTER + activeRadius * device.radius * Math.cos(rad);
  const y = CENTER + activeRadius * device.radius * Math.sin(rad);

  const ICON_CONTAINER_SIZE = 64;

  const animatedStyle = useAnimatedStyle(() => {
    // Góc hiện tại của tia quét
    const currentRot = currentBeamRotation % 360;

    // Tính khoảng cách góc từ đầu tia quét lùi về phía đuôi thiết bị
    let diff = currentRot - device.angle;
    if (diff < 0) diff += 360;

    // Đuôi tia quét dài 133 độ (từ 360 lùi về 226.87 theo mã CSS).
    // Nếu thiết bị nằm trong khoảng này => tia đang quét qua
    const isScanning = diff > 0 && diff < 133;

    return {
      transform: [{ scale: withTiming(isScanning ? 1.15 : 1, { duration: 300 }) }],
      borderColor: withTiming(isScanning ? HIGHLIGHT_COLOR : 'transparent', { duration: 300 }),
      borderWidth: withTiming(isScanning ? 3 : 0, { duration: 300 }),
      opacity: withTiming(isScanning ? 1 : 0.7, { duration: 300 }),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - ICON_CONTAINER_SIZE / 2,
          top: y - ICON_CONTAINER_SIZE / 2,
          width: ICON_CONTAINER_SIZE,
          height: ICON_CONTAINER_SIZE,
          borderRadius: ICON_CONTAINER_SIZE / 2,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={{ uri: device.imageUrl }}
        style={{
          width: ICON_CONTAINER_SIZE - 12,
          height: ICON_CONTAINER_SIZE - 12,
          borderRadius: (ICON_CONTAINER_SIZE - 12) / 2,
        }}
        contentFit="cover"
      />
    </Animated.View>
  );
}

export function AddDeviceScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const [step, setStep] = useState<EAddDeviceStep>(EAddDeviceStep.SEARCH);

  const rotation = useSharedValue(0);

  useEffect(() => {
    // Xoay tròn radar liên tục (60fps mượt mà)
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3500, // Tốc độ quét 3.5s/vòng
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const [devices] = useState<DeviceResult[]>([
    { id: '1', name: 'Tapo TP-Link C210', status: 'connecting', imageUrl: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=200&h=200&fit=crop', angle: 210, radius: 0.8 },
    { id: '2', name: 'Smart Bulb RGB', status: 'connected', imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=200&h=200&fit=crop', angle: 110, radius: 0.65 },
    { id: '3', name: 'Alexa Echo Dot', status: 'failed', imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&h=200&fit=crop', angle: 30, radius: 0.75 },
    { id: '4', name: 'Pendant Light', status: 'connected', imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?w=200&h=200&fit=crop', angle: 320, radius: 0.85 },
  ]);

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const renderRadar = () => (
    <View
      className="relative items-center justify-center"
      style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
    >
      {/* LỚP 1: CÁC VÒNG TRÒN NỀN XẾP CHỒNG (DÙNG SKIA CHO CHUẨN MÀU VÀ ĐẸP) */}
      <Canvas style={{ position: 'absolute', width: RADAR_SIZE, height: RADAR_SIZE }}>
        {/* Vòng ngoài cùng */}
        <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE * 0.48}>
          <SkiaLinearGradient
            start={vec(CENTER, 0)}
            end={vec(CENTER, RADAR_SIZE)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.1)']}
          />
        </SkiaCircle>
        {/* Vòng giữa */}
        <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE * 0.35}>
          <SkiaLinearGradient
            start={vec(CENTER, 0)}
            end={vec(CENTER, RADAR_SIZE)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.2)']}
          />
        </SkiaCircle>
        {/* Vòng trong cùng */}
        <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE * 0.20}>
          <SkiaLinearGradient
            start={vec(CENTER, 0)}
            end={vec(CENTER, RADAR_SIZE)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.1)']}
          />
        </SkiaCircle>
      </Canvas>

      {/* LỚP 2: TIA QUÉT QUAY TRÒN (SWEEP GRADIENT CHUẨN CSS Figma) */}
      <Animated.View
        style={[beamStyle, { position: 'absolute', width: RADAR_SIZE, height: RADAR_SIZE }]}
      >
        <Canvas style={{ flex: 1 }}>
          <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE / 2}>
            <SweepGradient
              c={vec(CENTER, CENTER)}
              colors={[
                'rgba(163, 236, 62, 0)',
                'rgba(163, 236, 62, 0)',
                'rgba(163, 236, 62, 0.5)',
              ]}
              // 226.87deg / 360deg = 0.63019
              positions={[0, 0.63019, 1]}
            />
          </SkiaCircle>
        </Canvas>
      </Animated.View>

      {/* LỚP 3: THIẾT BỊ NỔI LÊN (Render đè lên trên cùng) */}
      {devices.map((device) => (
        <RadarDeviceIcon key={device.id} device={device} currentBeamRotation={rotation.value} />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View className="flex-1 px-5">
      <View className="items-center justify-center py-8">
        {renderRadar()}

        <View className="mt-8 items-center">
          <Text className="text-center text-[24px] font-bold" style={{ color: TEXT_PRIMARY }}>
            {translate('base.searching')}
          </Text>
          <Text
            className="mt-2 text-center text-[14px]/[20px] font-normal"
            style={{ color: TEXT_SECONDARY, paddingHorizontal: 40 }}
          >
            {translate('base.searchingDesc')}
          </Text>
        </View>
      </View>

      <View className="mt-auto pb-10">
        <View
          className="mb-8 flex-row items-center rounded-2xl bg-white p-4 shadow-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="size-12 items-center justify-center rounded-xl bg-neutral-100">
            <MaterialCommunityIcons name="camera-outline" size={24} color="#737373" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[15px] font-bold" style={{ color: TEXT_PRIMARY }}>
              Tapo TP-Link C210 360°
            </Text>
            <Text className="text-xs font-semibold text-amber-500">{translate('base.connecting')}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setStep(EAddDeviceStep.RESULTS)}
          className="h-14 w-full items-center justify-center rounded-2xl"
          style={{ backgroundColor: PRIMARY_GREEN_HEX }}
        >
          <Text className="text-[16px] font-bold text-white">{translate('base.allowAndContinue')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="mt-4 h-14 w-full items-center justify-center rounded-2xl bg-neutral-100"
        >
          <Text className="text-[16px] font-semibold text-neutral-600">{translate('base.addManually')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1 px-5 pb-10">
      <View className="flex-1 pt-6">
        <Text className="text-[18px] font-bold" style={{ color: TEXT_PRIMARY }}>
          {translate('base.foundDevices', { count: devices.length })}
        </Text>
        <Text className="mt-1 text-[14px] font-normal" style={{ color: TEXT_SECONDARY }}>
          {translate('base.scanAgainDesc')}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
          {devices.map((device) => (
            <View
              key={device.id}
              className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="size-12 items-center justify-center rounded-xl bg-neutral-100">
                <MaterialCommunityIcons
                  name={device.name.toLowerCase().includes('camera') ? 'camera-outline' : 'devices'}
                  size={24}
                  color="#737373"
                />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-[15px] font-bold" style={{ color: TEXT_PRIMARY }}>
                  {device.name}
                </Text>
                <Text
                  className={`mt-0.5 text-xs font-semibold ${device.status === 'connected'
                      ? 'text-success-500'
                      : device.status === 'failed'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`}
                >
                  {device.status === 'connected'
                    ? translate('base.connectedStatus')
                    : device.status === 'failed'
                      ? translate('base.unableToConnect')
                      : translate('base.connecting')}
                </Text>
              </View>
              {device.status === 'connected' ? (
                <View className="size-6 items-center justify-center rounded-full bg-success-100">
                  <MaterialCommunityIcons name="check" size={16} color="#34C759" />
                </View>
              ) : device.status === 'failed' ? (
                <TouchableOpacity className="size-8 items-center justify-center rounded-full bg-neutral-100">
                  <MaterialCommunityIcons name="refresh" size={18} color="#737373" />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setStep(EAddDeviceStep.ROOM_ASSIGN)}
        className="h-14 w-full items-center justify-center rounded-2xl"
        style={{ backgroundColor: PRIMARY_GREEN_HEX }}
      >
        <Text className="text-[16px] font-bold text-white">{translate('base.continue')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1 px-5 pb-10">
      <View className="flex-1 pt-6">
        <Text className="text-[18px] font-bold" style={{ color: TEXT_PRIMARY }}>
          {translate('base.manageRoomAndDevice')}
        </Text>

        <View className="mt-8">
          <Text className="text-[14px] font-bold" style={{ color: TEXT_PRIMARY }}>
            {translate('base.selectRoomTitle')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -ml-2">
            {[
              { label: translate('base.kitchen'), icon: 'silverware-fork-knife', color: '#FFD7B2' },
              { label: translate('base.livingRoom'), icon: 'sofa', color: '#B2EBF2' },
              { label: translate('base.bedroom'), icon: 'bed', color: '#F8BBD0' },
            ].map((room) => (
              <TouchableOpacity
                key={room.label}
                className="ml-2 items-center justify-center rounded-2xl bg-white p-4 shadow-sm"
                style={{
                  width: 110,
                  height: 110,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  className="size-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: room.color }}
                >
                  <MaterialCommunityIcons name={room.icon as any} size={24} color="#424242" />
                </View>
                <Text className="mt-2 text-xs font-bold" style={{ color: TEXT_PRIMARY }}>
                  {room.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="ml-2 items-center justify-center rounded-2xl bg-neutral-50 px-4 py-2"
              style={{ width: 110, height: 110 }}
            >
              <MaterialCommunityIcons name="plus" size={32} color="#737373" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="mt-10">
          <Text className="text-[14px] font-bold" style={{ color: TEXT_PRIMARY }}>
            {translate('base.devices')}
          </Text>
          <View className="mt-4">
            {devices
              .filter((d) => d.status === 'connected' || d.status === 'connecting')
              .map((device) => (
                <View
                  key={device.id}
                  className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="size-10 items-center justify-center rounded-xl bg-neutral-50">
                    <MaterialCommunityIcons
                      name={
                        device.name.toLowerCase().includes('camera') ? 'camera-outline' : 'devices'
                      }
                      size={22}
                      color="#737373"
                    />
                  </View>
                  <Text
                    className="ml-4 flex-1 text-[15px] font-bold"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    {device.name}
                  </Text>
                  <MaterialCommunityIcons name="check-circle" size={24} color={PRIMARY_GREEN_HEX} />
                </View>
              ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          /* Finalize */
        }}
        className="h-14 w-full items-center justify-center rounded-2xl"
        style={{ backgroundColor: PRIMARY_GREEN_HEX }}
      >
        <Text className="text-[16px] font-bold text-white">{translate('base.finish')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseLayout>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="relative w-full flex-1">
        <Image
          source={theme === ETheme.Dark ? require('@@/assets/base/background-dark.png') : require('@@/assets/base/background-light.png')}
          style={[{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }, StyleSheet.absoluteFillObject]}
          contentFit="cover"
        />
        <View style={{ paddingTop: insets.top, flex: 1 }}>
          <View className="h-14 flex-row items-center px-5">
            <TouchableOpacity
              onPress={() => {
                /* navigation handle */
              }}
              className="size-10 items-center justify-center rounded-full bg-white/60"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#1B1B1B" />
            </TouchableOpacity>
            <Text className="ml-4 text-[18px] font-bold" style={{ color: TEXT_PRIMARY }}>
              {translate('base.addDevice')}
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