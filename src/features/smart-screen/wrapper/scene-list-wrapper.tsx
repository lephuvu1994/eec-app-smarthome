import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { TSceneCard } from '../components/sortable-scene-grid';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert, ScrollView } from 'react-native';
import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';
import { RecommendationCard } from '@/components/base/scene/RecommendationCard';
import { showSuccessMessage, Text, View } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { useDeleteScene, useReorderScenes, useRunScene, useScenes } from '@/features/scenes/common/use-scenes';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';
import { useSceneFilterStore } from '@/stores/scene/scene-filter-store';
import { SceneDelaySheet } from '../components/scene-delay-sheet';
import { SceneFilterTabBar } from '../components/scene-filter-tab-bar';
import { SortableSceneGrid } from '../components/sortable-scene-grid';
import { useMapSceneToCard } from '../hooks/use-map-scene-to-card';
import { useSceneFilterTabs } from '../hooks/use-scene-filter-tabs';

// ─── Component ───────────────────────────────────────────────────────────────

type TProps = {
  type: 'automation' | 'tapToRun';
  className?: string;
};

export const SceneListWrapper: React.FC<TProps> = ({ type, className }) => {
  const router = useRouter();
  const homeId = useHomeStore.use.selectedHomeId();
  const isAutomation = type === 'automation';

  const activeFilters = useSceneFilterStore(s =>
    isAutomation ? s.activeAutomationFilters : s.activeTapToRunFilters,
  );
  const toggleFilter = useSceneFilterStore(s =>
    isAutomation ? s.toggleAutomationFilter : s.toggleTapToRunFilter,
  );

  const floors = useHomeDataStore(s => s.floors);
  const rooms = useHomeDataStore(s => s.rooms);

  // ── Real scene data từ API ─────────────────────────────────────────────────
  const { data: allScenes = [] } = useScenes(homeId);
  const { mutate: runScene } = useRunScene();
  const { mutate: deleteScene } = useDeleteScene(homeId);
  const { mutate: reorderScenes } = useReorderScenes(homeId);

  const delaySheetRef = useRef<BottomSheetModal>(null);
  const [activeDelaySceneId, setActiveDelaySceneId] = useState<string | null>(null);

  const filteredScenes = useMemo(
    () =>
      allScenes.filter(s =>
        isAutomation ? s.triggers && s.triggers.length > 0 : !s.triggers || s.triggers.length === 0,
      ),
    [allScenes, isAutomation],
  );

  const mapToCard = useMapSceneToCard(rooms, type);
  const scenecards = useMemo<TSceneCard[]>(() => filteredScenes.map(mapToCard), [filteredScenes, mapToCard]);

  // ── Card state — lifted from Grid, sync khi API data thay đổi ─────────────
  const [cards, setCards] = useState<TSceneCard[]>(scenecards);
  useEffect(() => {
    setCards(scenecards);
  }, [scenecards]);

  // ── Filter tabs ─────────────────────────────────────────────────────────────
  const filterTabs = useSceneFilterTabs(floors, rooms);

  const handleRunScene = useCallback(
    (card: TSceneCard) => {
      runScene(card.key, {
        onSuccess: () => showSuccessMessage(card.title),
      });
    },
    [runScene],
  );

  const handleReorder = useCallback(
    (orderedKeys: string[]) => {
      setCards((prev) => {
        const keyToCard = Object.fromEntries(prev.map(c => [c.key, c]));
        return orderedKeys.map(k => keyToCard[k]).filter(Boolean) as TSceneCard[];
      });
      // Optimistic API call
      if (homeId) {
        reorderScenes(orderedKeys);
      }
    },
    [homeId, reorderScenes],
  );

  const handleCreateScene = useCallback(() => {
    router.push('/(app)/(mobile)/(scene)/hub' as any);
  }, [router]);

  const handleCardAction = useCallback((action: 'delay' | 'edit' | 'delete', card: TSceneCard) => {
    switch (action) {
      case 'edit':
        router.push(`/(app)/(mobile)/(scene)/${card.key}/edit` as any);
        break;
      case 'delay':
        setActiveDelaySceneId(card.key);
        delaySheetRef.current?.present();
        break;
      case 'delete':
        Alert.alert(
          translate('base.delete' as any) || 'Xoá kịch bản',
          (translate('base.deleteConfirm' as any) || 'Bạn có chắc muốn xoá kịch bản này? Có thể sẽ ảnh hưởng đến các lịch hẹn đang chạy.') as string,
          [
            { text: translate('base.cancel'), style: 'cancel' },
            {
              text: translate('base.delete' as any) || 'Xoá',
              style: 'destructive',
              onPress: () => {
                deleteScene(card.key, {
                  onSuccess: () => showSuccessMessage((translate('base.deleteSuccess' as any) || 'Đã xoá') as string),
                });
              },
            },
          ],
        );
        break;
    }
  }, [router, deleteScene]);

  return (
    <View className={cn('flex-1', className)}>
      {homeId && (
        <SceneFilterTabBar
          tabs={filterTabs}
          selected={activeFilters}
          onToggle={toggleFilter as any}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
      >
        <View style={{
          paddingBottom: cards.length > 0 ? BASE_SPACE_HORIZONTAL : 0,
        }}
        >
          <SortableSceneGrid
            cards={cards}
            activeFilters={activeFilters}
            onCardAction={handleCardAction}
            {...(!isAutomation ? { onCardPress: handleRunScene } : {})}
            onReorder={handleReorder}
          />
        </View>

        <View className="px-4">
          <PrimarySceneCard
            title={translate('settings.introduction.feature2')}
            bgGradient={['#34D399', '#059669']}
            textColor="#FFFFFF"
            menuIconColor="#FFFFFF"
            iconBgColor="rgba(255, 255, 255, 0.2)"
            icon={<MaterialCommunityIcons name="spa-outline" size={24} color="#FFFFFF" />}
            showGlossyEffect
            useAspectRatio={false}
            containerStyle={{ width: '100%', height: 130 }}
            onPress={handleCreateScene}
          />
        </View>

        <View className="mt-6 mb-2 w-full flex-row flex-wrap items-center justify-center px-4">
          <Text className="text-sm text-[#1B1B1B]">
            {translate('scenes.unavailableText', { count: 1 })}
          </Text>
          <Text className="text-sm font-medium text-[#059669] underline">
            {translate('scenes.unavailableLink')}
          </Text>
        </View>

        <View className="mt-4 w-full px-4">
          <View className="mb-2 border-x-0 border-y border-[#E5E7EB] py-3">
            <Text className="ml-1 text-[16px] font-semibold text-[#1B1B1B]">
              {translate('scenes.recommendationTitle')}
            </Text>
          </View>
          <RecommendationCard
            title={translate('automation.bar.allOn')}
            usageCount="498.7K"
            bgImage={require('@@/assets/scene/recommendation-bg.webp')}
          />
          <RecommendationCard
            title={translate('automation.bar.allOff')}
            usageCount="498.7K"
            bgImage={require('@@/assets/scene/recommendation-bg-off.webp')}
          />
        </View>

        <SceneDelaySheet
          ref={delaySheetRef}
          sceneId={activeDelaySceneId}
          onSuccess={() => showSuccessMessage(translate('automation.countdown.timerSet' as any) || 'Đã hẹn giờ kịch bản')}
        />
      </ScrollView>
    </View>
  );
};
