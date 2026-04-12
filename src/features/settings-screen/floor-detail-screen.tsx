import type { TRoom } from '@/types/home';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { useDeleteFloor, useUpdateFloor } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { ETheme } from '@/types/base';

// ─── Room Row ─────────────────────────
function RoomRow({ room, isLast }: { room: TRoom; isLast: boolean }) {
  const handlePress = useCallback(() => {
    router.push({
      pathname: '/(app)/(mobile)/room-detail' as any,
      params: { roomId: room.id, roomName: room.name },
    });
  }, [room.id, room.name]);

  const deviceCount = room.entities?.length || 0;

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="flex-row items-center justify-between px-4 py-3.5"
      >
        <View className="flex-row items-center gap-3">
          <View className="size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <MaterialCommunityIcons name="door-open" size={18} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">
              {room.name}
            </Text>
            {deviceCount > 0 && (
              <Text className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
                {translate('roomManagement.deviceCount', { count: deviceCount })}
              </Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A3A3A3" />
      </TouchableOpacity>
      {!isLast && <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />}
    </>
  );
}

export function FloorDetailScreen() {
  const { floorId, floorName } = useLocalSearchParams<{ floorId: string; floorName: string }>();
  const headerOffset = useHeaderOffset();
  const params = useLocalSearchParams();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const insets = useSafeAreaInsets();

  const floors = useHomeDataStore(s => s.floors);
  const floor = floors?.find(f => f.id === floorId);
  const rooms = floor?.rooms ?? [];

  const [name, setName] = useState(floorName ?? '');
  const updateFloor = useUpdateFloor();
  const deleteFloor = useDeleteFloor();

  const handleSave = useCallback(() => {
    if (!floorId || !name.trim())
      return;
    updateFloor.mutate({ floorId, body: { name: name.trim() } });
  }, [floorId, name, updateFloor]);

  const handleDelete = useCallback(() => {
    if (!floorId)
      return;
    Alert.alert(
      translate('roomManagement.deleteFloor'),
      translate('roomManagement.confirmDeleteFloor'),
      [
        { text: translate('base.cancel'), style: 'cancel' },
        {
          text: translate('base.deleteButton'),
          style: 'destructive',
          onPress: () => {
            deleteFloor.mutate(floorId, {
              onSuccess: () => router.back(),
            });
          },
        },
      ],
    );
  }, [floorId, deleteFloor]);

  const handleOpenAssign = useCallback(() => {
    router.push({
      pathname: '/(app)/(mobile)/assign-rooms' as any,
      params: { floorId },
    });
  }, [floorId]);

  return (
    <BaseLayout>
      <Stack.Screen />
      <View className="relative w-full flex-1">
        <CustomHeader
          title={(params.floorName as string) || translate('home.floorName' as any) || 'Floor'}
          tintColor={theme === 'dark' ? '#FFF' : '#1B1B1B'}
          leftContent={(
            <HeaderIconButton onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerOffset + 8, paddingBottom: insets.bottom + 32 }}
        >
          {/* ─── Floor name ─── */}
          <Text className="mx-6 mb-2 text-[13px] font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            {translate('roomManagement.floorInfo', { defaultValue: 'Thông tin tầng' })}
          </Text>
          <View className="mx-4 mb-5 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <View className="px-4 py-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {translate('roomManagement.floorName')}
                </Text>
                <TouchableOpacity
                  onPress={handleOpenAssign}
                  activeOpacity={0.7}
                  className="size-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40"
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#6366F1" />
                </TouchableOpacity>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={translate('roomManagement.floorNamePlaceholder')}
                placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-[#1B1B1B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </View>
          </View>

          {/* ─── Rooms section ─── */}
          <View className="mb-2 flex-row items-end justify-between px-6">
            <Text className="text-[13px] font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
              {translate('roomManagement.assignedRooms', { defaultValue: 'Danh sách phòng' })}
            </Text>
            {rooms.length > 0 && (
              <Text className="text-[12px] font-bold text-neutral-400 dark:text-neutral-500">
                {rooms.length}
              </Text>
            )}
          </View>

          {rooms.length > 0
            ? (
                <View className="mx-4 mb-6 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                  {rooms.map((room, idx) => (
                    <RoomRow key={room.id} room={room} isLast={idx === rooms.length - 1} />
                  ))}
                </View>
              )
            : (
                <View className="mx-4 mb-6 items-center overflow-hidden rounded-2xl bg-white py-6 shadow-sm dark:bg-neutral-800">
                  <View className="size-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-700">
                    <MaterialCommunityIcons
                      name="door-open"
                      size={24}
                      color={isDark ? '#525252' : '#D4D4D4'}
                    />
                  </View>
                  <Text className="mt-3 text-sm text-neutral-400">
                    {translate('roomManagement.noRooms')}
                  </Text>
                  <TouchableOpacity
                    onPress={handleOpenAssign}
                    activeOpacity={0.8}
                    className="mt-4 flex-row items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5"
                  >
                    <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                    <Text className="text-[14px] font-semibold text-white">
                      {translate('roomManagement.addRoomToFloor')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

          {/* ─── Save button ─── */}
          <View className="mx-4 mb-4">
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim() || updateFloor.isPending}
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
              disabled={deleteFloor.isPending}
              activeOpacity={0.7}
              className="items-center rounded-xl bg-red-500 py-3.5 disabled:opacity-50"
            >
              <Text className="text-[15px] font-semibold text-white">
                {translate('roomManagement.deleteFloor')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
