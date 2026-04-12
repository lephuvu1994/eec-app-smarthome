import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { TFloor, TRoom } from '@/lib/api/homes/home.service';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

import { CreateFloorModal } from './components/create-floor-modal';
import { CreateRoomModal } from './components/create-room-modal';

// Remove THomeManagementHandle

// ─── Room Item ────────────────────────────
function RoomItem({ room }: { room: TRoom }) {
  const deviceCount = useDeviceStore((s) => {
    return s.devices.filter(d => d.room?.id === room.id).length;
  },
  );

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/(app)/(mobile)/room-detail' as any,
      params: { roomId: room.id, roomName: room.name },
    });
  }, [room.id, room.name]);

  return (
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
          <Text className="text-xs text-neutral-400">
            {translate('roomManagement.deviceCount', { count: deviceCount })}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#A3A3A3" />
    </TouchableOpacity>
  );
}

// ─── Floor Section ────────────────────────
function FloorSection({ floor }: { floor: TFloor }) {
  const handleFloorPress = useCallback(() => {
    router.push({
      pathname: '/(app)/(mobile)/floor-detail' as any,
      params: { floorId: floor.id, floorName: floor.name },
    });
  }, [floor.id, floor.name]);

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
      <TouchableOpacity
        onPress={handleFloorPress}
        activeOpacity={0.7}
        className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-700"
      >
        <View className="flex-row items-center gap-3">
          <View className="size-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
            <MaterialCommunityIcons name="layers-outline" size={18} color="#059669" />
          </View>
          <View>
            <Text className="text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
              {floor.name}
            </Text>
            <Text className="text-xs text-neutral-400">
              {translate('roomManagement.roomsCount', { count: floor.rooms?.length ?? 0 })}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#A3A3A3" />
      </TouchableOpacity>

      {(floor.rooms ?? []).map((room, idx) => (
        <View key={room.id}>
          <RoomItem room={room} />
          {idx < (floor.rooms?.length ?? 0) - 1 && (
            <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
          )}
        </View>
      ))}

      {(!floor.rooms || floor.rooms.length === 0) && (
        <View className="items-center py-4">
          <Text className="text-sm text-neutral-400">{translate('roomManagement.noRooms')}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────
export function HomeManagementScreen() {
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const isDark = theme === ETheme.Dark;
  const navigation = useNavigation();
  const iconColor = isDark ? '#FFF' : '#1B1B1B';
  const selectedHomeId = useHomeStore(s => s.selectedHomeId) ?? '';

  const floors = useHomeDataStore(s => s.floors);
  const allRooms = useHomeDataStore(s => s.rooms);

  const createFloorRef = useRef<BottomSheetModal>(null);
  const createRoomRef = useRef<BottomSheetModal>(null);

  const ungroupedRooms = useMemo(() => {
    if (!allRooms)
      return [];
    return allRooms.filter(room => !room.floorId);
  }, [allRooms]);

  const hasFloors = (floors ?? []).length > 0;

  // No longer exporting actions via ref, handled directly

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('base.roomManagement')}
          tintColor={iconColor}
          leftContent={(
            <HeaderIconButton onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={iconColor} />
            </HeaderIconButton>
          )}
          rightContent={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <HeaderIconButton onPress={() => createRoomRef.current?.present()}>
                <MaterialCommunityIcons name="door-open" size={22} color={iconColor} />
              </HeaderIconButton>
              <HeaderIconButton onPress={() => createFloorRef.current?.present()}>
                <MaterialCommunityIcons name="layers-plus" size={22} color={iconColor} />
              </HeaderIconButton>
              <HeaderIconButton onPress={() => {}}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color={iconColor} />
              </HeaderIconButton>
            </View>
          )}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerOffset + 8, paddingBottom: insets.bottom + 32 }}
        >
          <View className="px-4">
            {hasFloors
              ? (
                  <>
                    {floors!.map(floor => (
                      <FloorSection key={floor.id} floor={floor} />
                    ))}

                    {ungroupedRooms.length > 0 && (
                      <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                        <View className="flex-row items-center gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-700">
                          <View className="size-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
                            <MaterialCommunityIcons name="folder-question-outline" size={18} color="#D97706" />
                          </View>
                          <View>
                            <Text className="text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
                              {translate('base.ungroupedRooms')}
                            </Text>
                            <Text className="text-xs text-neutral-400">
                              {translate('roomManagement.roomsCount', { count: ungroupedRooms.length })}
                            </Text>
                          </View>
                        </View>
                        {ungroupedRooms.map((room, idx) => (
                          <View key={room.id}>
                            <RoomItem room={room} />
                            {idx < ungroupedRooms.length - 1 && (
                              <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )
              : (
                  <>
                    {allRooms && allRooms.length > 0
                      ? (
                          <View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                            {allRooms.map((room, idx) => (
                              <View key={room.id}>
                                <RoomItem room={room} />
                                {idx < allRooms.length - 1 && (
                                  <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                                )}
                              </View>
                            ))}
                          </View>
                        )
                      : (
                          <View className="items-center py-12">
                            <MaterialCommunityIcons
                              name="door-open"
                              size={48}
                              color={isDark
                                ? '#525252'
                                : '#D4D4D4'}
                            />
                            <Text className="mt-3 text-sm text-neutral-400">
                              {translate('roomManagement.noRooms')}
                            </Text>
                          </View>
                        )}
                  </>
                )}
          </View>
        </ScrollView>

        <CreateRoomModal ref={createRoomRef} homeId={selectedHomeId} />
        <CreateFloorModal ref={createFloorRef} homeId={selectedHomeId} />
      </View>
    </BaseLayout>
  );
}
