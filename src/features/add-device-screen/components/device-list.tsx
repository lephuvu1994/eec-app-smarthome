import type { DeviceResult } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { PRIMARY_GREEN_HEX, TEXT_PRIMARY, TEXT_SECONDARY } from '../constants';

export function DeviceList({
  devices,
  onContinue,
}: {
  devices: DeviceResult[];
  onContinue: () => void;
}) {
  return (
    <View className="flex-1 px-5 pb-10">
      <View className="flex-1 pt-6">
        <Text className="text-[18px] font-bold" style={{ color: TEXT_PRIMARY }}>
          {translate('base.foundDevices', { count: devices.length })}
        </Text>
        <Text className="mt-1 text-[14px] font-normal" style={{ color: TEXT_SECONDARY }}>
          {translate('base.scanAgainDesc')}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
          {devices.map(device => (
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
              {device.status === 'connected'
                ? (
                    <View className="size-6 items-center justify-center rounded-full bg-success-100">
                      <MaterialCommunityIcons name="check" size={16} color="#34C759" />
                    </View>
                  )
                : device.status === 'failed'
                  ? (
                      <TouchableOpacity className="size-8 items-center justify-center rounded-full bg-neutral-100">
                        <MaterialCommunityIcons name="refresh" size={18} color="#737373" />
                      </TouchableOpacity>
                    )
                  : null}
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onContinue}
        className="h-14 w-full items-center justify-center rounded-2xl"
        style={{ backgroundColor: PRIMARY_GREEN_HEX }}
      >
        <Text className="text-[16px] font-bold text-white">{translate('base.continue')}</Text>
      </TouchableOpacity>
    </View>
  );
}
