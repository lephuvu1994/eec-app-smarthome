import type { TSceneFilterTab } from '../components/scene-filter-tab-bar';
import type { TSceneCard } from '../components/sortable-scene-grid';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';
import { RecommendationCard } from '@/components/base/scene/RecommendationCard';
import { showSuccessMessage, Text, View } from '@/components/ui';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';
import { SceneFilterTabBar } from '../components/scene-filter-tab-bar';
import { SortableSceneGrid } from '../components/sortable-scene-grid';

// ─── Static Data (sẽ thay bằng API sau) ─────────────────────────────────────

const TAP_TO_RUN_CARDS: TSceneCard[] = [
  {
    key: 'tap-all-on',
    title: 'Bật tất cả',
    colSpan: 1,
    cardColor: '#ECFDF5',
    iconBgColor: '#D1FAE5',
    textColor: '#065F46',
    menuIconColor: '#10B981',
    icon: <MaterialCommunityIcons name="lightning-bolt" size={20} color="#10B981" />,
  },
  {
    key: 'tap-all-off',
    title: 'Tắt tất cả',
    colSpan: 1,
    cardColor: '#FEF2F2',
    iconBgColor: '#FEE2E2',
    textColor: '#991B1B',
    menuIconColor: '#EF4444',
    icon: <MaterialCommunityIcons name="power" size={20} color="#EF4444" />,
  },
  {
    key: 'tap-movie',
    title: 'Chế độ xem phim',
    colSpan: 1,
    cardColor: '#1F2937',
    iconBgColor: '#374151',
    textColor: '#F9FAFB',
    menuIconColor: '#9CA3AF',
    showGlossyEffect: true,
    icon: <MaterialCommunityIcons name="movie-open-outline" size={20} color="#A78BFA" />,
    filterTags: ['favorite', 'room-living'],
  },
  {
    key: 'tap-sleep',
    title: 'Đi ngủ',
    colSpan: 1,
    cardColor: '#EFF6FF',
    iconBgColor: '#DBEAFE',
    textColor: '#1E3A8A',
    menuIconColor: '#60A5FA',
    icon: <MaterialCommunityIcons name="weather-night" size={20} color="#3B82F6" />,
    filterTags: ['room-bed'],
  },
  {
    key: 'tap-eco',
    title: 'Chế độ tiết kiệm điện toàn nhà',
    colSpan: 2,
    bgGradient: ['#34D399', '#059669'],
    textColor: '#FFFFFF',
    menuIconColor: '#FFFFFF',
    iconBgColor: 'rgba(255,255,255,0.2)',
    showGlossyEffect: true,
    icon: <MaterialCommunityIcons name="leaf" size={22} color="#FFFFFF" />,
    filterTags: ['favorite'],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type TProps = {
  className?: string;
};

export const TapToRunSceneWrapper: React.FC<TProps> = ({ className }) => {
  const homeId = useHomeStore.use.selectedHomeId();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(() => new Set());

  const floors = useHomeDataStore(s => s.floors);
  const rooms = useHomeDataStore(s => s.rooms);

  const floorNameMap = useMemo(
    () => Object.fromEntries(floors.map(f => [f.id, f.name])),
    [floors],
  );

  const filterTabs = useMemo<TSceneFilterTab[]>(() => {
    const roomTabs: TSceneFilterTab[] = rooms.map(room => ({
      id: `room-${room.id}`,
      label: room.floorId && floorNameMap[room.floorId]
        ? `${floorNameMap[room.floorId]} - ${room.name}`
        : room.name,
    }));
    return [{ id: 'favorite', label: 'Yêu thích' }, ...roomTabs];
  }, [rooms, floorNameMap]);

  const handleToggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      }
      else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // TODO: thay bằng useMutation khi có API endpoint
  const handleRunScene = useCallback((card: TSceneCard) => {
    showSuccessMessage(`Đang chạy: ${card.title}`);
  }, []);

  return (
    <ScrollView
      className={className}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* --- TAB BAR FILTER (Yêu thích + Rooms từ API) --- */}
      {homeId && (
        <SceneFilterTabBar
          tabs={filterTabs}
          selected={activeFilters}
          onToggle={handleToggleFilter}
        />
      )}

      {/* Grid drag & drop — có onCardPress → card pressable để chạy scene */}
      <SortableSceneGrid
        initialCards={TAP_TO_RUN_CARDS}
        activeFilters={activeFilters}
        onCardPress={handleRunScene}
      />

      {/* --- BANNER (FULL BỀ NGANG) --- */}
      <View className="mt-6 px-4">
        <PrimarySceneCard
          title="Chế độ Tự động làm mát & Hệ thống sinh thái xanh"
          bgGradient={['#34D399', '#059669']}
          textColor="#FFFFFF"
          menuIconColor="#FFFFFF"
          iconBgColor="rgba(255, 255, 255, 0.2)"
          icon={<MaterialCommunityIcons name="spa-outline" size={24} color="#FFFFFF" />}
          showGlossyEffect
          containerStyle={{ width: '100%', height: 130 }}
        />
      </View>

      {/* --- TEXT CẢNH BÁO KỊCH BẢN --- */}
      <View className="mt-6 mb-2 w-full flex-row flex-wrap items-center justify-center px-4">
        <Text className="text-sm text-[#1B1B1B]">1 kịch bản chưa khả dụng. </Text>
        <View>
          <Text className="text-sm font-medium text-[#059669] underline">Nhấn để xem thêm.</Text>
        </View>
      </View>

      {/* --- PHẦN ĐỀ XUẤT (RECOMMENDATION) --- */}
      <View className="mt-4 w-full px-4">
        <View className="mb-2 border-x-0 border-y border-[#E5E7EB] py-3">
          <Text className="ml-1 text-[16px] font-semibold text-[#1B1B1B]">Đề xuất</Text>
        </View>
        <RecommendationCard
          title="Bật tất cả công tắc"
          usageCount="498.7K"
          bgImage={require('@@/assets/scene/recommendation-bg.webp')}
        />
        <RecommendationCard
          title="Tắt toàn bộ thiết bị"
          usageCount="498.7K"
          bgImage={require('@@/assets/scene/recommendation-bg-off.webp')}
        />
      </View>
    </ScrollView>
  );
};
