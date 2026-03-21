import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { useDeleteRoom, useUpdateRoom } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { ETheme } from '@/types/base';

// ─── Setting Row ──────────────────────────
function SettingRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center justify-between px-4 py-3.5"
    >
      <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">{label}</Text>
      <View className="flex-row items-center gap-1">
        {value && (
          <Text className="text-sm text-neutral-400 dark:text-neutral-500">{value}</Text>
        )}
        {onPress && <MaterialCommunityIcons name="chevron-right" size={20} color="#A3A3A3" />}
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="ml-4 h-px bg-neutral-100 dark:bg-neutral-700" />;
}

// ─── Main Screen ──────────────────────────
export function RoomDetailScreen() {
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string; roomName: string }>();
  const headerHeight = useHeaderHeight();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const insets = useSafeAreaInsets();

  const floors = useHomeDataStore(s => s.floors);
  const [name, setName] = useState(roomName ?? '');
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  // Find which floor this room belongs to
  const currentFloor = useMemo(() => {
    if (!floors)
      return null;
    return floors.find(f => f.rooms?.some(r => r.id === roomId)) ?? null;
  }, [floors, roomId]);

  const handleSave = useCallback(() => {
    if (!roomId || !name.trim())
      return;
    updateRoom.mutate({ roomId, body: { name: name.trim() } });
  }, [roomId, name, updateRoom]);

  const handleDelete = useCallback(() => {
    if (!roomId)
      return;
    Alert.alert(
      translate('roomManagement.deleteRoom'),
      translate('roomManagement.confirmDeleteRoom'),
      [
        { text: translate('base.cancel'), style: 'cancel' },
        {
          text: translate('base.deleteButton'),
          style: 'destructive',
          onPress: () => {
            deleteRoom.mutate(roomId, {
              onSuccess: () => router.back(),
            });
          },
        },
      ],
    );
  }, [roomId, deleteRoom]);

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={
            isDark
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: insets.bottom + 32 }}
        >
          {/* ─── Room name ─── */}
          <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <View className="px-4 py-3">
              <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {translate('roomManagement.roomName')}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={translate('roomManagement.roomNamePlaceholder')}
                placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-[#1B1B1B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </View>
          </View>

          {/* ─── Info section ─── */}
          <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <SettingRow
              label={translate('roomManagement.group')}
              value={currentFloor?.name ?? translate('base.ungroupedRooms')}
            />
            <Divider />
            <SettingRow
              label={translate('roomManagement.devices')}
              value={translate('roomManagement.deviceCount', {
                count: currentFloor?.rooms?.find((r) => r.id === roomId)?.features?.length ?? 0,
              })}
              onPress={() => router.push({ pathname: '/assign-room-features', params: { roomId } })}
            />
            <Divider />
            <SettingRow
              label={translate('roomManagement.scenes')}
              value={translate('roomManagement.sceneCount', {
                count: currentFloor?.rooms?.find((r) => r.id === roomId)?.scenes?.length ?? 0,
              })}
              onPress={() => router.push({ pathname: '/assign-room-scenes', params: { roomId } })}
            />
          </View>

          {/* ─── Room settings ─── */}
          <View className="mx-4 mb-4">
            <Text className="mb-2 px-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {translate('roomManagement.roomSettings')}
            </Text>
            <View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
              <SettingRow label={translate('roomManagement.showVideoComponent')} />
              <Divider />
              <SettingRow label={translate('roomManagement.linkedVideo')} />
              <Divider />
              <SettingRow label={translate('roomManagement.viewMode')} />
            </View>
          </View>

          {/* ─── Save button ─── */}
          <View className="mx-4 mb-4">
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim() || updateRoom.isPending}
              activeOpacity={0.8}
              className="items-center rounded-xl bg-emerald-500 py-3.5 disabled:opacity-50"
            >
              <Text className="text-[15px] font-semibold text-white">
                {translate('base.saveButton')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── Delete ─── */}
          <View className="mx-4">
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteRoom.isPending}
              activeOpacity={0.7}
              className="items-center rounded-xl bg-red-500 py-3.5 disabled:opacity-50"
            >
              <Text className="text-[15px] font-semibold text-white">
                {translate('roomManagement.deleteRoom')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
