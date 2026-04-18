import type { TScene } from '@/types/scene';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { SectionList, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderBackButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, View } from '@/components/ui';
import { useSceneBuilderStore } from '@/features/scenes/builder/stores/scene-builder-store';
import { sceneService } from '@/lib/api/scenes/scene.service';
import { translate } from '@/lib/i18n';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TSection = { title: string; data: TScene[] };

function groupScenesByRoom(
  scenes: TScene[],
  rooms: { id: string; name: string }[],
): TSection[] {
  const grouped = new Map<string, TScene[]>();

  for (const scene of scenes) {
    const key = scene.roomId ?? '__none__';
    const arr = grouped.get(key) ?? [];
    arr.push(scene);
    grouped.set(key, arr);
  }

  const sections: TSection[] = [];

  for (const room of rooms) {
    const items = grouped.get(room.id);
    if (items?.length) {
      sections.push({ title: room.name, data: items });
    }
  }

  const noRoom = grouped.get('__none__');
  if (noRoom?.length) {
    sections.push({ title: translate('base.ungroupedRooms'), data: noRoom });
  }

  return sections;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SceneSelectorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const homeId = useHomeStore.use.selectedHomeId();
  const rooms = useHomeDataStore(s => s.rooms ?? []);
  const setPendingSceneRun = useSceneBuilderStore(s => s.setPendingSceneRun);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: scenes = [] } = useQuery({
    queryKey: ['scenes', homeId],
    queryFn: () => sceneService.getScenes(homeId!),
    enabled: !!homeId,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? scenes.filter(s => s.name.toLowerCase().includes(q)) : scenes;
  }, [scenes, search]);

  const sections = useMemo(() => groupScenesByRoom(filtered, rooms), [filtered, rooms]);

  const handleConfirm = useCallback(() => {
    if (!selectedId)
      return;
    const sceneInfo = scenes.find((s) => s.id === selectedId);
    if (sceneInfo) {
      setPendingSceneRun({ id: selectedId, name: sceneInfo.name });
    }
    router.back();
  }, [selectedId, scenes, setPendingSceneRun, router]);

  return (
    <BaseLayout>
      <CustomHeader
        title={translate('scenes.builder.selectScene')}
        tintColor={isDark ? '#FFFFFF' : '#1B1B1B'}
        leftContent={<HeaderBackButton onPress={() => router.back()} color={isDark ? '#FFFFFF' : '#1B1B1B'} />}
        rightContent={(
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selectedId}
            style={{ opacity: selectedId ? 1 : 0.35 }}
            className="px-1"
          >
            <Text className="text-primary text-[16px] font-semibold">
              {translate('base.confirmButton')}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Search bar */}
      <View
        style={{ marginTop: headerOffset }}
        className="px-4 pt-3 pb-1"
      >
        <View className="flex-row items-center gap-2 rounded-xl bg-neutral-100 px-3 dark:bg-white/10">
          <MaterialCommunityIcons name="magnify" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={translate('base.searchDevice')}
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            className="flex-1 py-2.5 text-[15px] text-neutral-900 dark:text-white"
          />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
          paddingTop: 8,
        }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text className="mt-4 mb-1 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const selected = item.id === selectedId;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedId(item.id)}
              className={`mb-2 flex-row items-center gap-3 rounded-2xl px-4 py-4 ${selected
                ? 'bg-emerald-50 dark:bg-emerald-900/30'
                : 'bg-white dark:bg-white/10'
                }`}
            >
              {/* Scene icon */}
              <View
                className="size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: item.color ?? '#6366F1', opacity: 0.9 }}
              >
                <MaterialCommunityIcons name={(item.icon as any) ?? 'lightning-bolt'} size={20} color="#FFFFFF" />
              </View>

              <Text className={`flex-1 text-[15px] font-semibold ${selected ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'}`}>
                {item.name}
              </Text>

              {/* Radio indicator */}
              <View className={`size-5 items-center justify-center rounded-full border-2 ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-300 dark:border-neutral-600'}`}>
                {selected && <View className="size-2 rounded-full bg-white" />}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={(
          <View className="flex-1 items-center justify-center py-20">
            <MaterialCommunityIcons name="playlist-remove" size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
            <Text className="mt-3 text-sm text-neutral-400">{translate('base.noData')}</Text>
          </View>
        )}
      />
    </BaseLayout>
  );
}
