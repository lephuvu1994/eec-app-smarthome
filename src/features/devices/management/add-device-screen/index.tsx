import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import Animated, { FadeIn, FadeOut, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { ApConnectGuide } from './components/ap-connect-guide';
import { ConfiguringView } from './components/configuring-view';
import { DeviceList } from './components/device-list';
import { LedConfirm } from './components/led-confirm';
import { RadarView } from './components/radar-view';
import { RoomAssignment } from './components/room-assignment';
import { SetupForm } from './components/setup-form';
import { RADAR_SIZE } from './constants';
import { useAddDevice } from './hooks/use-add-device';
import { EAddDeviceStep, EPairingMode } from './types';

export function AddDeviceScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const queryClient = useQueryClient();

  const {
    step,
    setStep,
    pairingMode,
    devices,
    deviceName,
    setDeviceName,
    wifiSsid,
    setWifiSsid,
    wifiPass,
    setWifiPass,
    rotation,
    isRegistering,
    isConnectingAP,
    configuringStatus,
    selectDevice,
    choosePairingMode,
    connectDeviceAP,
    submitDeviceConfig,
  } = useAddDevice();

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const hasDevices = devices.length > 0;

  const renderScanningStep = () => (
    <View className="flex-1 px-5">
      {/* Radar — shrink when devices found */}
      <View
        className={`items-center justify-center ${hasDevices ? 'py-2' : 'py-8'}`}
        style={{ transform: [{ scale: 0.85 }] }}
      >
        <RadarView radarSize={RADAR_SIZE} devices={devices} rotation={rotation} beamStyle={beamStyle} />
      </View>

      {/* Searching text — only when no devices */}
      {!hasDevices && (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} className="items-center">
          <Text className="text-center text-[24px] font-bold text-[#1A1A1A] dark:text-white">
            {translate('base.searching')}
          </Text>
          <Text
            className="mt-2 px-10 text-center text-[14px]/[20px] font-normal text-[#666666] dark:text-neutral-400"
          >
            {translate('base.searchingDesc')}
          </Text>
        </Animated.View>
      )}

      {/* Device list */}
      {hasDevices && (
        <View className="flex-1">
          <DeviceList
            devices={devices}
            onSelect={selectDevice}
          />
        </View>
      )}

      {/* Add manually — always at the bottom */}
      <View className="mt-auto">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setStep(EAddDeviceStep.LED_CONFIRM);
          }}
          className="mt-4 mb-10 h-14 w-full items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800"
        >
          <Text className="text-[16px] font-semibold text-neutral-600 dark:text-neutral-300">
            {translate('base.addManually')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case EAddDeviceStep.SCANNING:
        return renderScanningStep();

      case EAddDeviceStep.LED_CONFIRM:
        return <LedConfirm onSelect={choosePairingMode} />;

      case EAddDeviceStep.CONNECTING:
        if (pairingMode === EPairingMode.AP) {
          return (
            <ApConnectGuide
              isConnecting={isConnectingAP}
              onConnect={connectDeviceAP}
            />
          );
        }
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-bold text-[#1A1A1A] dark:text-white">
              {translate('base.connecting')}
            </Text>
            <Text className="mt-2 text-[#666666] dark:text-neutral-400">
              {translate('base.searchingDesc')}
            </Text>
          </View>
        );

      case EAddDeviceStep.SETUP:
        return (
          <SetupForm
            deviceName={deviceName}
            setDeviceName={setDeviceName}
            wifiSsid={wifiSsid}
            setWifiSsid={setWifiSsid}
            wifiPass={wifiPass}
            setWifiPass={setWifiPass}
            isSubmitting={isRegistering}
            onContinue={submitDeviceConfig}
          />
        );

      case EAddDeviceStep.CONFIGURING:
        return <ConfiguringView statusText={configuringStatus} />;

      case EAddDeviceStep.COMPLETE:
        return (
          <RoomAssignment
            devices={devices}
            isRegistering={false}
            onFinish={() => {
              queryClient.invalidateQueries({ queryKey: ['devices'] });
              router.back();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <BaseLayout>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="relative w-full flex-1">
        <View style={{ paddingTop: insets.top, flex: 1 }}>
          <View className="relative h-14 flex-row items-center justify-center px-5">
            <TouchableOpacity
              onPress={() => {
                if (step === EAddDeviceStep.SCANNING) {
                  router.back();
                }
                else if (step === EAddDeviceStep.LED_CONFIRM) {
                  setStep(EAddDeviceStep.SCANNING);
                }
                else if (step === EAddDeviceStep.CONNECTING) {
                  setStep(pairingMode === EPairingMode.AP ? EAddDeviceStep.LED_CONFIRM : EAddDeviceStep.SCANNING);
                }
                else if (step === EAddDeviceStep.SETUP) {
                  setStep(pairingMode === EPairingMode.AP ? EAddDeviceStep.LED_CONFIRM : EAddDeviceStep.SCANNING);
                }
                else {
                  router.back();
                }
              }}
              className="absolute left-5 z-10 size-10 items-center justify-center rounded-full bg-white/60 dark:bg-white/10"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <Feather name="arrow-left" size={24} color={theme === ETheme.Dark ? '#FFFFFF' : '#1B1B1B'} />
            </TouchableOpacity>
            <Text className="text-[18px] font-bold text-[#1B1B1B] dark:text-white">
              {translate('base.addDevice')}
            </Text>
          </View>

          {renderStepContent()}
        </View>
      </View>
    </BaseLayout>
  );
}
