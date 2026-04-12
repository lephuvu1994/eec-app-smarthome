import { TScene } from '@/types/scene';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderIconButton, SpringButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { useAssignScenesToRoom } from '@/hooks/use-homes';
import { useScenes } from '@/hooks/use-scenes';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

// ─── Scene Row ─────────────────────────────
function SceneRow({
  scene,
  action,
  onPress,
}: {
  scene: TScene;
  action: 'add' | 'remove';
  onPress: () => void;
}) {
  const isAdd = action === 'add';
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-1 flex-row items-center gap-3">
        <View className="size-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/30">
          <MaterialCommunityIcons name="movie-open-play-outline" size={18} color="#F97316" />
        </View>
        <Text
          className="flex-1 text-[15px] font-medium text-[#1B1B1B] dark:text-white"
          numberOfLines={1}
        >
          {scene.name}
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
export function AssignRoomScenesScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();

  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const { data: scenes = [], isLoading: isScenesLoading } = useScenes(selectedHomeId ?? '');

  const assignScenes = useAssignScenesToRoom();

  // Original UI IDs belonging to this room
  const originalSceneIds = useMemo(
    () => new Set(scenes.filter(s => s.roomId === roomId).map(s => s.id)),
    [scenes, roomId],
  );

  // Local state
  const [localAssignedIds, setLocalAssignedIds] = useState<Set<string>>(() => new Set());

  // Sync initially when fetched
  useEffect(() => {
    if (originalSceneIds.size > 0 && localAssignedIds.size === 0) {
      queueMicrotask(() => {
        setLocalAssignedIds(() => new Set(originalSceneIds));
      });
    }
  }, [originalSceneIds, localAssignedIds.size]);

  // Has unsaved changes?
  const hasChanges = useMemo(() => {
    if (localAssignedIds.size !== originalSceneIds.size)
      return true;
    for (const id of Array.from(localAssignedIds)) {
      if (!originalSceneIds.has(id))
        return true;
    }
    return false;
  }, [localAssignedIds, originalSceneIds]);

  const [isSaving, setIsSaving] = useState(false);

  const assignedScenes = useMemo(() => scenes.filter(s => localAssignedIds.has(s.id)), [scenes, localAssignedIds]);
  const availableScenes = useMemo(() => scenes.filter(s => !localAssignedIds.has(s.id)), [scenes, localAssignedIds]);

  const handleAdd = useCallback((sceneId: string) => {
    setLocalAssignedIds((prev) => {
      const next = new Set(prev);
      next.add(sceneId);
      return next;
    });
  }, []);

  const handleRemove = useCallback((sceneId: string) => {
    setLocalAssignedIds((prev) => {
      const next = new Set(prev);
      next.delete(sceneId);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving || !roomId)
      return;
    setIsSaving(true);

    try {
      await new Promise((resolve, reject) => {
        assignScenes.mutate(
          {
            roomId,
            body: {
              sceneIds: Array.from(localAssignedIds),
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
  }, [hasChanges, isSaving, localAssignedIds, roomId, assignScenes]);

  const iconColor = isDark ? '#FFF' : '#1B1B1B';

  if (isScenesLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-900">
      <CustomHeader
        title={translate('roomManagement.scenes')}
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
        {/* ─── Assigned Scenes ─── */}
        <View className="mx-4 mb-5">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons name="check-circle-outline" size={16} color={isDark ? '#6EE7B7' : '#059669'} />
            <Text className="text-[13px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Đã gán vào phòng (
              {assignedScenes.length}
              )
            </Text>
          </View>

          <Animated.View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800" layout={LinearTransition}>
            {assignedScenes.length > 0
              ? (
                  assignedScenes.map((s, idx) => (
                    <Animated.View key={s.id} layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
                      <SceneRow scene={s} action="remove" onPress={() => handleRemove(s.id)} />
                      {idx < assignedScenes.length - 1 && (
                        <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                      )}
                    </Animated.View>
                  ))
                )
              : (
                  <View className="items-center py-6">
                    <MaterialCommunityIcons name="movie-open-play-outline" size={32} color={isDark ? '#525252' : '#D4D4D4'} />
                    <Text className="mt-2 text-sm text-neutral-400">Chưa có kịch bản nào</Text>
                  </View>
                )}
          </Animated.View>
        </View>

        {/* ─── Available Scenes ─── */}
        <View className="mx-4">
          <View className="mb-2 flex-row items-center gap-2 px-1">
            <MaterialCommunityIcons name="plus-circle-outline" size={16} color={isDark ? '#A5B4FC' : '#6366F1'} />
            <Text className="text-[13px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Có thể gán (
              {availableScenes.length}
              )
            </Text>
          </View>

          <Animated.View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800" layout={LinearTransition}>
            {availableScenes.length > 0
              ? (
                  availableScenes.map((s, idx) => (
                    <Animated.View key={s.id} layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
                      <SceneRow scene={s} action="add" onPress={() => handleAdd(s.id)} />
                      {idx < availableScenes.length - 1 && (
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
