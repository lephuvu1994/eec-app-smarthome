import * as React from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { PRIMARY_GREEN_HEX } from '../constants';

export function SetupForm({
  deviceName,
  setDeviceName,
  wifiSsid,
  setWifiSsid,
  wifiPass,
  setWifiPass,
  isSubmitting = false,
  onContinue,
}: {
  deviceName: string;
  setDeviceName: (v: string) => void;
  wifiSsid: string;
  setWifiSsid: (v: string) => void;
  wifiPass: string;
  setWifiPass: (v: string) => void;
  isSubmitting?: boolean;
  onContinue: () => void;
}) {
  return (
    <KeyboardAwareScrollView
      bottomOffset={40}
      className="flex-1 px-5 pt-8"
      contentContainerStyle={{ paddingBottom: 0 }}
    >
      <Text className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
        {translate('base.configureDevice')}
      </Text>
      <Text className="mt-2 text-[15px] font-medium text-[#666666] dark:text-neutral-400">
        {translate('base.configureDeviceDesc')}
      </Text>

      <View className="mt-10 gap-y-4">
        <View className="rounded-2xl border border-neutral-100 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
          <Text className="mb-1 text-xs font-bold text-neutral-400">{translate('base.deviceName')}</Text>
          <TextInput
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder={translate('base.deviceNamePlaceholder')}
            placeholderTextColor="#9CA3AF"
            className="text-[16px] font-medium text-[#1A1A1A] dark:text-white"
          />
        </View>

        <View className="rounded-2xl border border-neutral-100 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
          <Text className="mb-1 text-xs font-bold text-neutral-400">{translate('base.wifiNetwork')}</Text>
          <TextInput
            value={wifiSsid}
            onChangeText={setWifiSsid}
            placeholder={translate('base.wifiSsidPlaceholder')}
            placeholderTextColor="#9CA3AF"
            className="text-[16px] font-medium text-[#1A1A1A] dark:text-white"
          />
        </View>

        <View className="rounded-2xl border border-neutral-100 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
          <Text className="mb-1 text-xs font-bold text-neutral-400">{translate('base.wifiPassword')}</Text>
          <TextInput
            value={wifiPass}
            onChangeText={setWifiPass}
            placeholder={translate('base.wifiPasswordPlaceholder')}
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            className="text-[16px] font-medium text-[#1A1A1A] dark:text-white"
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onContinue}
        disabled={isSubmitting || !wifiSsid.trim()}
        className="mt-10 h-14 w-full flex-row items-center justify-center rounded-2xl"
        style={{
          backgroundColor: PRIMARY_GREEN_HEX,
          opacity: isSubmitting || !wifiSsid.trim() ? 0.5 : 1,
        }}
      >
        {isSubmitting
          ? <ActivityIndicator size="small" color="#1B1B1B" />
          : <Text className="text-[16px] font-bold text-[#1B1B1B]">{translate('base.continue')}</Text>}
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}
