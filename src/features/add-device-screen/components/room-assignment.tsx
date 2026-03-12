import type { DeviceResult } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { PRIMARY_GREEN_HEX, TEXT_PRIMARY } from '../constants';

export function RoomAssignment({
  devices,
  isRegistering,
  onFinish,
}: {
  devices: DeviceResult[];
  isRegistering: boolean;
  onFinish: () => void;
}) {
  return (
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
            ].map(room => (
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
              .filter(d => d.status === 'connected' || d.status === 'connecting')
              .map(device => (
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
        onPress={onFinish}
        disabled={isRegistering}
        className={`h-14 w-full items-center justify-center rounded-2xl ${isRegistering ? 'opacity-50' : ''}`}
        style={{ backgroundColor: PRIMARY_GREEN_HEX }}
      >
        <Text className="text-[16px] font-bold text-white">
          {isRegistering ? 'Loading...' : translate('base.finish')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
