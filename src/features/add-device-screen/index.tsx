import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

import { DeviceList } from './components/device-list';
// Sub-components
import { RadarView } from './components/radar-view';
import { RoomAssignment } from './components/room-assignment';

import { SetupForm } from './components/setup-form';
import { PRIMARY_GREEN_HEX, TEXT_PRIMARY, TEXT_SECONDARY } from './constants';
import { useAddDevice } from './hooks/use-add-device';
import { EAddDeviceStep } from './types';

export function AddDeviceScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();

  const {
    step,
    setStep,
    devices,
    deviceName,
    setDeviceName,
    wifiSsid,
    setWifiSsid,
    wifiPass,
    setWifiPass,
    rotation,
    isRegistering,
    connectDevice,
    submitDeviceConfig,
  } = useAddDevice();

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const renderSearchStep = () => (
    <View className="flex-1 px-5">
      <View className="items-center justify-center py-8">
        <RadarView devices={devices} rotation={rotation} beamStyle={beamStyle} />

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
                router.back();
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

          {step === EAddDeviceStep.SEARCH && renderSearchStep()}

          {step === EAddDeviceStep.RESULTS && (
            <DeviceList
              devices={devices}
              onContinue={() => {
                const device = devices[0]; // Logic for selecting device
                if (device)
                  connectDevice(device);
              }}
            />
          )}

          {step === EAddDeviceStep.SETUP && (
            <SetupForm
              deviceName={deviceName}
              setDeviceName={setDeviceName}
              wifiSsid={wifiSsid}
              setWifiSsid={setWifiSsid}
              wifiPass={wifiPass}
              setWifiPass={setWifiPass}
              onContinue={() => setStep(EAddDeviceStep.ROOM_ASSIGN)}
            />
          )}

          {step === EAddDeviceStep.ROOM_ASSIGN && (
            <RoomAssignment
              devices={devices}
              isRegistering={isRegistering}
              onFinish={() => {
                const connectedDevice = devices.find(d => d.status === 'connected');
                if (connectedDevice)
                  submitDeviceConfig(connectedDevice);
              }}
            />
          )}
        </View>
      </View>
    </BaseLayout>
  );
}
