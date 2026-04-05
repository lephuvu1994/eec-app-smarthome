import type { TDeviceResult } from '@/features/devices/management/add-device-screen/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { PRIMARY_GREEN_HEX, TEXT_PRIMARY, TEXT_SECONDARY } from '../constants';

/** Map BLE device name to icon */
function getDeviceIcon(name: string): React.ComponentProps<typeof MaterialCommunityIcons>['name'] {
  const n = name.toLowerCase();
  if (n.includes('door') || n.includes('gate'))
    return 'door';
  if (n.includes('switch') || n.includes('light'))
    return 'lightbulb-outline';
  if (n.includes('camera'))
    return 'camera-outline';
  if (n.includes('sensor'))
    return 'access-point';
  return 'devices';
}

export function DeviceList({
  devices,
  onSelect,
}: {
  devices: TDeviceResult[];
  onSelect: (device: TDeviceResult) => void;
}) {
  return (
    <View className="flex-1">
      <View className="flex-1 pt-4">
        {/* Title — fade in */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Text className="text-[18px] font-bold" style={{ color: TEXT_PRIMARY }}>
            {translate('base.foundDevices', { count: devices.length })}
          </Text>
          <Text className="mt-1 text-[14px] font-normal" style={{ color: TEXT_SECONDARY }}>
            {translate('base.scanAgainDesc')}
          </Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
          {devices.map((device, index) => (
            <Animated.View
              key={device.id}
              entering={SlideInDown.delay(index * 80).duration(400)}
            >
              <View
                className="mb-4 flex-row items-center rounded-[20px] border border-[#E5E7EB] bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="size-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
                  <MaterialCommunityIcons
                    name={getDeviceIcon(device.name)}
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
                      ? 'text-neutral-500'
                      : device.status === 'failed'
                        ? 'text-red-500'
                        : device.status === 'connecting'
                          ? 'text-[#A3EC3E]'
                          : 'text-neutral-500'
                    }`}
                  >
                    {device.status === 'connected'
                      ? translate('base.connectedStatus')
                      : device.status === 'failed'
                        ? translate('base.unableToConnect')
                        : device.status === 'connecting'
                          ? translate('base.connecting')
                          : translate('base.readyToConnect')}
                  </Text>
                </View>

                {device.status === 'found' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onSelect(device)}
                    className="rounded-full px-5 py-2"
                    style={{ backgroundColor: PRIMARY_GREEN_HEX }}
                  >
                    <Text className="text-[13px] font-bold text-[#1A1A1A]">
                      {translate('base.connect')}
                    </Text>
                  </TouchableOpacity>
                )}
                {device.status === 'connected' && (
                  <View className="size-6 items-center justify-center rounded-full bg-success-100">
                    <MaterialCommunityIcons name="check" size={16} color="#34C759" />
                  </View>
                )}
                {device.status === 'failed' && (
                  <TouchableOpacity
                    onPress={() => onSelect(device)}
                    className="size-8 items-center justify-center rounded-full bg-neutral-100"
                  >
                    <MaterialCommunityIcons name="refresh" size={18} color="#737373" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
