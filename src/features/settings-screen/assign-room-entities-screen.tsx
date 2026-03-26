import type { TDeviceEntity } from '@/lib/api/devices/device.service';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { useHomeDevices } from '@/hooks/use-devices';
import { useAssignFeaturesToRoom } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

// ─── Feature Row ─────────────────────────────
function FeatureRow({
  feature,
  deviceName,
  isOnline,
  action,
  onPress,
}: {
  feature: TDeviceEntity;
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
            {feature.name || feature.code}
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
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();

  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const { data: devicesRes, isLoading: isDevicesLoading } = useHomeDevices(selectedHomeId ?? '');
  const assignFeatures = useAssignFeaturesToRoom();
  const devicesMemo = useMemo(() => devicesRes?.data ?? [], [devicesRes?.data]);

  // Flatten ONLY the Primary logical entities across all devices for clean UI
  const allFeatures = useMemo(() => {
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
  const originalFeatureIds = useMemo(
    () => new Set(allFeatures.filter(f => f.deviceRoomId === roomId).map(f => f.id)),
    [allFeatures, roomId],
  );

  // Local state: IDs of features currently assigned (uncommitted)
  const [localAssignedIds, setLocalAssignedIds] = useState<Set<string>>(() => new Set());

  // Sync initially when fetched
  useEffect(() => {
    if (originalFeatureIds.size > 0 && localAssignedIds.size === 0) {
      queueMicrotask(() => {
        setLocalAssignedIds(() => new Set(originalFeatureIds));
      });
    }
  }, [originalFeatureIds, localAssignedIds.size]);

  // Has unsaved changes?
  const hasChanges = useMemo(() => {
    if (localAssignedIds.size !== originalFeatureIds.size)
      return true;
    for (const id of localAssignedIds) {
      if (!originalFeatureIds.has(id))
        return true;
    }
    return false;
  }, [localAssignedIds, originalFeatureIds]);

  const [isSaving, setIsSaving] = useState(false);

  // Compute lists
  const assignedFeatures = useMemo(() => {
    return allFeatures.filter(f => localAssignedIds.has(f.id));
  }, [allFeatures, localAssignedIds]);

  const availableFeatures = useMemo(() => {
    return allFeatures.filter(f => !localAssignedIds.has(f.id));
  }, [allFeatures, localAssignedIds]);

  const handleAdd = useCallback((featureId: string) => {
    setLocalAssignedIds(prev => new Set([...prev, featureId]));
  }, []);

  const handleRemove = useCallback((featureId: string) => {
    setLocalAssignedIds((prev) => {
      const next = new Set(prev);
      next.delete(featureId);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving || !roomId)
      return;
    setIsSaving(true);

    // Expand localAssignedIds to encompass Dependent Modifiers (e.g. Brightness)
    // guaranteeing the BE replaces all required sub-endpoints safely
    const payloadFeatureIds = new Set<string>();

    Array.from(localAssignedIds).forEach((primaryId) => {
      payloadFeatureIds.add(primaryId);

      const parentDevice = devicesMemo.find(d => d.entities?.some(e => e.id === primaryId));
      if (parentDevice) {
        // Entity attributes are handled together — no separate dependent expansion needed
      }
    });

    try {
      await new Promise((resolve, reject) => {
        assignFeatures.mutate(
          {
            roomId,
            body: {
              featureIds: Array.from(payloadFeatureIds),
            },
          },
          { onSuccess: resolve, onError: reject },
        );
      });

      navigation.goBack();
    }
    catch {
      // Error handled by hook
    }
    finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, localAssignedIds, roomId, assignFeatures, devicesMemo, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="size-9 items-center justify-center"
        >
          <MaterialCommunityIcons name="close" size={24} color={isDark ? '#FFF' : '#1B1B1B'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
          activeOpacity={0.7}
          className="h-9 w-12 items-center justify-center"
        >
          {isSaving
            ? (
                <ActivityIndicator size="small" color="#6366F1" />
              )
            : (
                <Text className={`text-[16px] font-semibold ${hasChanges ? 'text-indigo-500' : 'text-neutral-300 dark:text-neutral-600'}`}>
                  {translate('base.saveButton')}
                </Text>
              )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSave, hasChanges, isSaving, isDark]);

  if (isDevicesLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: headerHeight + 16 }}
      >
        {/* ─── Assigned Features ─── */}
        <View className="mx-4 mb-5">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={16}
              color={isDark ? '#6EE7B7' : '#059669'}
            />
            <Text className="text-[13px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Đã gán vào phòng (
              {assignedFeatures.length}
              )
            </Text>
          </View>

          <Animated.View
            className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
            layout={LinearTransition}
          >
            {assignedFeatures.length > 0
              ? (
                  assignedFeatures.map((f, idx) => (
                    <Animated.View
                      key={f.id}
                      layout={LinearTransition}
                      entering={FadeIn}
                      exiting={FadeOut}
                    >
                      <FeatureRow
                        feature={f}
                        deviceName={f.deviceName}
                        isOnline={f.isOnline}
                        action="remove"
                        onPress={() => handleRemove(f.id)}
                      />
                      {idx < assignedFeatures.length - 1 && (
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

        {/* ─── Available Features ─── */}
        <View className="mx-4">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={16}
              color={isDark ? '#A5B4FC' : '#6366F1'}
            />
            <Text className="text-[13px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Có thể gán (
              {availableFeatures.length}
              )
            </Text>
          </View>

          <Animated.View
            className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800"
            layout={LinearTransition}
          >
            {availableFeatures.length > 0
              ? (
                  availableFeatures.map((f, idx) => (
                    <Animated.View
                      key={f.id}
                      layout={LinearTransition}
                      entering={FadeIn}
                      exiting={FadeOut}
                    >
                      <FeatureRow
                        feature={f}
                        deviceName={f.deviceName}
                        isOnline={f.isOnline}
                        action="add"
                        onPress={() => handleAdd(f.id)}
                      />
                      {idx < availableFeatures.length - 1 && (
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
