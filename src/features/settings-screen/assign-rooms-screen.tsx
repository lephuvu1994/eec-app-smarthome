import type { TRoom } from '@/lib/api/homes/home.service';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderIconButton, SpringButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { useAssignRooms } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

// ─── Room Row ─────────────────────────────
function RoomRow({
  room,
  action,
  onPress,
}: {
  room: TRoom;
  action: 'add' | 'remove';
  onPress: () => void;
}) {
  const isAdd = action === 'add';
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-1 flex-row items-center gap-3">
        <View className="size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
          <MaterialCommunityIcons name="door-open" size={18} color="#3B82F6" />
        </View>
        <Text className="flex-1 text-[15px] font-medium text-[#1B1B1B] dark:text-white" numberOfLines={1}>
          {room.name}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`size-8 items-center justify-center rounded-full ${
          isAdd
            ? 'bg-indigo-100 dark:bg-indigo-900/40'
            : 'bg-red-100 dark:bg-red-900/40'
        }`}
      >
        <MaterialCommunityIcons
          name={isAdd ? 'plus' : 'minus'}
          size={18}
          color={isAdd ? '#6366F1' : '#EF4444'}
        />
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────
export function AssignRoomsScreen() {
  const { floorId } = useLocalSearchParams<{ floorId: string }>();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();

  const floors = useHomeDataStore(s => s.floors);
  const allRooms = useHomeDataStore(s => s.rooms);
  const syncFromAPI = useHomeDataStore(s => s.syncFromAPI);
  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const assignRooms = useAssignRooms();

  const floor = floors?.find(f => f.id === floorId);

  // Original room IDs belonging to this floor
  const originalRoomIds = useMemo(
    () => new Set((floor?.rooms ?? []).map(r => r.id)),
    [floor?.rooms],
  );

  // Local state: IDs of rooms currently assigned (uncommitted)
  const [localAssignedIds, setLocalAssignedIds] = useState<Set<string>>(
    () => new Set(originalRoomIds),
  );

  // Sync when original data changes (e.g. after coming back)
  useEffect(() => {
    queueMicrotask(() => {
      setLocalAssignedIds(() => new Set(originalRoomIds));
    });
  }, [originalRoomIds]);

  // Has unsaved changes?
  const hasChanges = useMemo(() => {
    if (localAssignedIds.size !== originalRoomIds.size)
      return true;
    for (const id of Array.from(localAssignedIds)) {
      if (!originalRoomIds.has(id))
        return true;
    }
    return false;
  }, [localAssignedIds, originalRoomIds]);

  const [isSaving, setIsSaving] = useState(false);

  // Compute lists from local state
  const assignedRooms = useMemo(() => {
    const all = [...(floor?.rooms ?? []), ...(allRooms ?? [])];
    const seen = new Set<string>();
    return all.filter((r) => {
      if (seen.has(r.id) || !localAssignedIds.has(r.id))
        return false;
      seen.add(r.id);
      return true;
    });
  }, [floor?.rooms, allRooms, localAssignedIds]);

  const availableRooms = useMemo(() => {
    if (!allRooms)
      return [];
    // Rooms not assigned to any floor OR removed from this floor locally
    return allRooms.filter(r => !r.floorId && !localAssignedIds.has(r.id));
  }, [allRooms, localAssignedIds]);

  // Local add/remove
  const handleAdd = useCallback((room: TRoom) => {
    setLocalAssignedIds((prev) => {
      const next = new Set(prev);
      next.add(room.id);
      return next;
    });
  }, []);

  const handleRemove = useCallback((room: TRoom) => {
    setLocalAssignedIds((prev) => {
      const next = new Set(prev);
      next.delete(room.id);
      return next;
    });
  }, []);

  // Batch save: call API for all changed rooms
  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving || !floorId)
      return;
    setIsSaving(true);

    try {
      await new Promise((resolve, reject) => {
        assignRooms.mutate(
          {
            floorId,
            body: {
              roomIds: Array.from(localAssignedIds),
            },
          },
          { onSuccess: resolve, onError: reject },
        );
      });

      if (selectedHomeId)
        await syncFromAPI(selectedHomeId);

      router.back();
    }
    catch {
      // Error handled by mutation hook
    }
    finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, localAssignedIds, floorId, assignRooms, syncFromAPI, selectedHomeId]);

  const iconColor = isDark ? '#FFF' : '#1B1B1B';

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <CustomHeader
        title={translate('roomManagement.addRoomToFloor')}
        tintColor={iconColor}
        leftContent={(
          <HeaderIconButton onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color={iconColor} />
          </HeaderIconButton>
        )}
        rightContent={(
          <SpringButton
            onPress={handleSave}
            disabled={!hasChanges || isSaving}
            style={{ paddingHorizontal: 8, height: 36, borderRadius: 8 }}
          >
            {isSaving
              ? <ActivityIndicator size="small" color="#6366F1" />
              : (
                  <Text className={`text-[15px] font-semibold ${hasChanges ? 'text-indigo-500' : 'text-neutral-300 dark:text-neutral-600'}`}>
                    {translate('base.saveButton')}
                  </Text>
                )}
          </SpringButton>
        )}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: headerOffset + 16 }}
      >
        {/* ─── Assigned Rooms ─── */}
        <View className="mx-4 mb-5">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={16}
              color={isDark ? '#6EE7B7' : '#059669'}
            />
            <Text className="text-[13px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              {translate('roomManagement.assignedRooms')}
            </Text>
            <View className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 dark:bg-emerald-900/40">
              <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                {assignedRooms.length}
              </Text>
            </View>
          </View>

          <Animated.View
            className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
            layout={LinearTransition}
          >
            {assignedRooms.length > 0
              ? assignedRooms.map((room, idx) => (
                  <Animated.View
                    key={room.id}
                    layout={LinearTransition}
                    entering={FadeIn}
                    exiting={FadeOut}
                  >
                    <RoomRow room={room} action="remove" onPress={() => handleRemove(room)} />
                    {idx < assignedRooms.length - 1 && (
                      <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                    )}
                  </Animated.View>
                ))
              : (
                  <View className="items-center py-6">
                    <MaterialCommunityIcons
                      name="door-open"
                      size={32}
                      color={isDark ? '#525252' : '#D4D4D4'}
                    />
                    <Text className="mt-2 text-sm text-neutral-400">
                      {translate('roomManagement.noRooms')}
                    </Text>
                  </View>
                )}
          </Animated.View>
        </View>

        {/* ─── Available Rooms ─── */}
        <View className="mx-4">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={16}
              color={isDark ? '#A5B4FC' : '#6366F1'}
            />
            <Text className="text-[13px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              {translate('roomManagement.availableRooms')}
            </Text>
            <View className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 dark:bg-indigo-900/40">
              <Text className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                {availableRooms.length}
              </Text>
            </View>
          </View>

          <Animated.View
            className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
            layout={LinearTransition}
          >
            {availableRooms.length > 0
              ? availableRooms.map((room, idx) => (
                  <Animated.View
                    key={room.id}
                    layout={LinearTransition}
                    entering={FadeIn}
                    exiting={FadeOut}
                  >
                    <RoomRow room={room} action="add" onPress={() => handleAdd(room)} />
                    {idx < availableRooms.length - 1 && (
                      <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                    )}
                  </Animated.View>
                ))
              : (
                  <View className="items-center py-6">
                    <MaterialCommunityIcons
                      name="check-all"
                      size={32}
                      color={isDark ? '#525252' : '#D4D4D4'}
                    />
                    <Text className="mt-2 text-sm text-neutral-400">
                      Tất cả phòng đã được phân nhóm
                    </Text>
                  </View>
                )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
