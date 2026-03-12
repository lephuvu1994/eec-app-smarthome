import * as React from 'react';
import { TextInput } from 'react-native';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { PRIMARY_GREEN_HEX, TEXT_PRIMARY, TEXT_SECONDARY } from '../constants';

export function SetupForm({
  deviceName,
  setDeviceName,
  wifiSsid,
  setWifiSsid,
  wifiPass,
  setWifiPass,
  onContinue,
}: {
  deviceName: string;
  setDeviceName: (v: string) => void;
  wifiSsid: string;
  setWifiSsid: (v: string) => void;
  wifiPass: string;
  setWifiPass: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <ScrollView
      className="flex-1 px-5 pt-8"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
        Configure Device
      </Text>
      <Text className="mt-2 text-[15px] font-medium" style={{ color: TEXT_SECONDARY }}>
        Enter a convenient name and the Wi-Fi credentials for your new device.
      </Text>

      <View className="mt-10 gap-y-4">
        <View className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
          <Text className="mb-1 text-xs font-bold text-neutral-400">Device Name</Text>
          <TextInput
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder="e.g. Living Room Lamp"
            className="text-[16px] font-medium"
            style={{ color: TEXT_PRIMARY }}
          />
        </View>

        <View className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
          <Text className="mb-1 text-xs font-bold text-neutral-400">Wi-Fi Network</Text>
          <TextInput
            value={wifiSsid}
            onChangeText={setWifiSsid}
            placeholder="Enter Wi-Fi SSID"
            className="text-[16px] font-medium"
            style={{ color: TEXT_PRIMARY }}
          />
        </View>

        <View className="rounded-2xl border border-neutral-100 bg-white px-4 py-3">
          <Text className="mb-1 text-xs font-bold text-neutral-400">Wi-Fi Password</Text>
          <TextInput
            value={wifiPass}
            onChangeText={setWifiPass}
            placeholder="Enter password"
            secureTextEntry
            className="text-[16px] font-medium"
            style={{ color: TEXT_PRIMARY }}
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onContinue}
        className="mt-10 h-14 w-full items-center justify-center rounded-2xl"
        style={{ backgroundColor: PRIMARY_GREEN_HEX }}
      >
        <Text className="text-[16px] font-bold text-white">Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
