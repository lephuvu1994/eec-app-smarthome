import type { TDeviceEntity } from '@/lib/api/devices/device.service';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderIconButton, SpringButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { useHomeDevices } from '@/hooks/use-devices';
import { useAssignEntitiesToRoom } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

// ─── Entity Row ─────────────────────────────
function EntityRow({
  entity,
  deviceName,
  isOnline,
  action,
  onPress,
}: {
  entity: TDeviceEntity;
  deviceName: string;
  isOnline: boolean;
  action: 'add' | 'remove';
  onPress: () => void;
}) {
  const isAdd = action === 'add';
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={`size-9 items-center justify-center rounded-xl ${
            isOnline ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-neutral-100 dark:bg-neutral-800'
          }`}
        >
          <MaterialCommunityIcons
            name="power-socket"
            size={18}
            color={isOnline ? '#3B82F6' : '#9CA3AF'}
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-[15px] font-medium text-[#1B1B1B] dark:text-white"
            numberOfLines={1}
          >
            {deviceName}
            {' '}
            -
            {entity.name || entity.code}
          </Text>
          <Text
            className={`mt-0.5 text-xs ${
              isOnline ? 'text-emerald-500' : 'text-neutral-400'
            }`}
          >
            {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>
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
export function AssignRoomEntitiesScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();

  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const { data: devicesRes, isLoading: isDevicesLoading } = useHomeDevices(selectedHomeId ?? '');
  const assignEntities = useAssignEntitiesToRoom();
  const devicesMemo = useMemo(() => devicesRes?.data ?? [], [devicesRes?.data]);

  // Flatten ONLY the Primary logical entities across all devices for clean UI
  const allEntities = useMemo(() => {
    return devicesMemo.flatMap(d =>
      getPrimaryEntities(d).map(f => ({
        ...f,
        deviceId: d.id,
        deviceName: d.name,
        isOnline: d.status === 'online',
        deviceRoomId: d.room?.id ?? null,
      })),
    );
  }, [devicesMemo]);

  // Original UI IDs belonging to this room
  const originalEntityIds = useMemo(
    () => new Set(allEntities.filter(f => f.deviceRoomId === roomId).map(f => f.id)),
    [allEntities, roomId],
  );

  // Local state: IDs of entities currently assigned (uncommitted)
  const [localAssignedIds, setLocalAssignedIds] = useState<Set<string>>(() => new Set());

  // Sync initially when fetched
  useEffect(() => {
    if (originalEntityIds.size > 0 && localAssignedIds.size === 0) {
      queueMicrotask(() => {
        setLocalAssignedIds(() => new Set(originalEntityIds));
      });
    }
  }, [originalEntityIds, localAssignedIds.size]);

  // Has unsaved changes?
  const hasChanges = useMemo(() => {
    if (localAssignedIds.size !== originalEntityIds.size)
      return true;
    for (const id of Array.from(localAssignedIds)) {
      if (!originalEntityIds.has(id))
        return true;
    }
    return false;
  }, [localAssignedIds, originalEntityIds]);

  const [isSaving, setIsSaving] = useState(false);

  // Compute lists
  const assignedEntities = useMemo(() => {
    return allEntities.filter(f => localAssignedIds.has(f.id));
  }, [allEntities, localAssignedIds]);

  const availableEntities = useMemo(() => {
    return allEntities.filter(f => !localAssignedIds.has(f.id));
  }, [allEntities, localAssignedIds]);

  const handleAdd = useCallback((entityId: string) => {
    setLocalAssignedIds((prev) => {
      const next = new Set(prev);
      next.add(entityId);
      return next;
    });
  }, []);

  const handleRemove = useCallback((entityId: string) => {
    setLocalAssignedIds((prev) => {
      const next = new Set(prev);
      next.delete(entityId);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving || !roomId)
      return;
    setIsSaving(true);

    const payloadEntityIds = new Set<string>();

    Array.from(localAssignedIds).forEach((primaryId) => {
      payloadEntityIds.add(primaryId);

      const parentDevice = devicesMemo.find(d => d.entities?.some(e => e.id === primaryId));
      if (parentDevice) {
        // Entity attributes are handled together — no separate dependent expansion needed
      }
    });

    try {
      await new Promise((resolve, reject) => {
        assignEntities.mutate(
          {
            roomId,
            body: {
              entityIds: Array.from(payloadEntityIds),
            },
          },
          { onSuccess: resolve, onError: reject },
        );
      });

      router.back();
    }
    catch {
      // Error handled by hook
    }
    finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, localAssignedIds, roomId, assignEntities, devicesMemo]);

  const iconColor = isDark ? '#FFF' : '#1B1B1B';

  if (isDevicesLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <CustomHeader
        title={translate('roomManagement.devices')}
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
              ? (
                  <ActivityIndicator size="small" color="#6366F1" />
                )
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
        {/* ─── Assigned Entities ─── */}
        <View className="mx-4 mb-5">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={16}
              color={isDark ? '#6EE7B7' : '#059669'}
            />
            <Text className="text-[13px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Đã gán vào phòng (
              {assignedEntities.length}
              )
            </Text>
          </View>

          <Animated.View
            className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
            layout={LinearTransition}
          >
            {assignedEntities.length > 0
              ? (
                  assignedEntities.map((f, idx) => (
                    <Animated.View
                      key={f.id}
                      layout={LinearTransition}
                      entering={FadeIn}
                      exiting={FadeOut}
                    >
                      <EntityRow
                        entity={f}
                        deviceName={f.deviceName}
                        isOnline={f.isOnline}
                        action="remove"
                        onPress={() => handleRemove(f.id)}
                      />
                      {idx < assignedEntities.length - 1 && (
                        <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                      )}
                    </Animated.View>
                  ))
                )
              : (
                  <View className="items-center py-6">
                    <MaterialCommunityIcons name="power-socket" size={32} color={isDark ? '#525252' : '#D4D4D4'} />
                    <Text className="mt-2 text-sm text-neutral-400">Chưa có thiết bị nào</Text>
                  </View>
                )}
          </Animated.View>
        </View>

        {/* ─── Available Entities ─── */}
        <View className="mx-4">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={16}
              color={isDark ? '#A5B4FC' : '#6366F1'}
            />
            <Text className="text-[13px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Có thể gán (
              {availableEntities.length}
              )
            </Text>
          </View>

          <Animated.View
            className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
            layout={LinearTransition}
          >
            {availableEntities.length > 0
              ? (
                  availableEntities.map((f, idx) => (
                    <Animated.View
                      key={f.id}
                      layout={LinearTransition}
                      entering={FadeIn}
                      exiting={FadeOut}
                    >
                      <EntityRow
                        entity={f}
                        deviceName={f.deviceName}
                        isOnline={f.isOnline}
                        action="add"
                        onPress={() => handleAdd(f.id)}
                      />
                      {idx < availableEntities.length - 1 && (
                        <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                      )}
                    </Animated.View>
                  ))
                )
              : (
                  <View className="items-center py-6">
                    <MaterialCommunityIcons name="check-all" size={32} color={isDark ? '#525252' : '#D4D4D4'} />
                    <Text className="mt-2 text-sm text-neutral-400">Tất cả đều đã được gán</Text>
                  </View>
                )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
