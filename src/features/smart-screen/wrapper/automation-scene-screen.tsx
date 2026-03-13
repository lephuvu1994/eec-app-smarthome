import type { TSceneCard } from '../components/sortable-scene-grid';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';
import { RecommendationCard } from '@/components/base/scene/RecommendationCard';
import { Text, View } from '@/components/ui';
import { SortableSceneGrid } from '../components/sortable-scene-grid';

// ─── Static Data ─────────────────────────────────────────────────────────────

const AUTOMATION_CARDS: TSceneCard[] = [
  {
    key: 'home',
    title: 'Về nhà',
    colSpan: 1,
    cardColor: '#FFFFFF',
    iconBgColor: '#F2FCEE',
    textColor: '#1B1B1B',
    menuIconColor: '#9CA3AF',
    icon: <MaterialCommunityIcons name="home-outline" size={20} color="#84CC16" />,
  },
  {
    key: 'wakeup',
    title: 'Thức dậy sớm',
    colSpan: 1,
    bgGradient: ['#FBBF24', '#F59E0B'],
    textColor: '#FFFFFF',
    menuIconColor: '#FFFFFF',
    iconBgColor: 'transparent',
    icon: <MaterialCommunityIcons name="white-balance-sunny" size={24} color="#FFFFFF" />,
  },
  {
    key: 'movie',
    title: 'Giải trí (Phim)',
    colSpan: 1,
    cardColor: '#1F2937',
    iconBgColor: '#374151',
    textColor: '#F9FAFB',
    menuIconColor: '#9CA3AF',
    showGlossyEffect: true,
    icon: <MaterialCommunityIcons name="movie-open-outline" size={20} color="#A78BFA" />,
  },
  {
    key: 'alarm',
    title: 'Báo động',
    colSpan: 1,
    cardColor: '#7F1D1D',
    iconBgColor: '#991B1B',
    textColor: '#FFFFFF',
    menuIconColor: '#FDA4AF',
    showGlossyEffect: true,
    icon: <MaterialCommunityIcons name="shield-alert-outline" size={20} color="#FECACA" />,
  },
  {
    key: 'sleep',
    title: 'Đi ngủ',
    colSpan: 1,
    cardColor: '#EFF6FF',
    iconBgColor: '#DBEAFE',
    textColor: '#1E3A8A',
    menuIconColor: '#60A5FA',
    icon: <MaterialCommunityIcons name="weather-night" size={20} color="#3B82F6" />,
  },
  {
    key: 'sleep2',
    title: 'Đi ngủ 2',
    colSpan: 1,
    cardColor: '#EFF6FF',
    iconBgColor: '#DBEAFE',
    textColor: '#1E3A8A',
    menuIconColor: '#60A5FA',
    icon: <MaterialCommunityIcons name="weather-night" size={20} color="#3B82F6" />,
  },
  {
    key: 'power-off',
    title: 'Tắt toàn bộ thiết bị nhà',
    colSpan: 2,
    cardColor: '#FEE2E2',
    textColor: '#991B1B',
    menuIconColor: '#EF4444',
    icon: null,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type TProps = {
  className?: string;
};

export const AutomationListSceneWrapper: React.FC<TProps> = ({ className }) => {
  return (
    <ScrollView
      className={className}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Grid drag & drop — không có onCardPress (automation chỉ xem/sắp xếp) */}
      <SortableSceneGrid initialCards={AUTOMATION_CARDS} />

      {/* --- BANNER (FULL BỀ NGANG) --- */}
      <View className="mt-6 px-4">
        <PrimarySceneCard
          title="Chế độ Tự động làm mát & Hệ thống sinh thái xanh"
          bgGradient={['#34D399', '#059669']}
          textColor="#FFFFFF"
          menuIconColor="#FFFFFF"
          iconBgColor="rgba(255, 255, 255, 0.2)"
          icon={<MaterialCommunityIcons name="spa-outline" size={24} color="#FFFFFF" />}
          showGlossyEffect={true}
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
          bgImage={require('@@/assets/scene/recommendation-bg.png')}
        />
        <RecommendationCard
          title="Tắt toàn bộ thiết bị"
          usageCount="498.7K"
          bgImage={require('@@/assets/scene/recommendation-bg-off.png')}
        />
      </View>
    </ScrollView>
  );
};
