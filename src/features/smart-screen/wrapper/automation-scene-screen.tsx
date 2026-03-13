import type { ReactNode } from 'react';
import type { ImageSourcePropType, ViewStyle } from 'react-native';
import type { OrderChangeParams } from 'react-native-sortables';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import Sortable from 'react-native-sortables';
import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';
import { RecommendationCard } from '@/components/base/scene/RecommendationCard';
import { Text, View } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE } from '@/constants';

// ─── Types ──────────────────────────────────────────────────────────────────

type TSceneCard = {
  key: string;
  title: string;
  colSpan: 1 | 2; // 1 = half-width (2 items/row), 2 = full-width (1 item/row)
  cardColor?: string;
  bgGradient?: [string, string];
  iconBgColor?: string;
  textColor?: string;
  menuIconColor?: string;
  showGlossyEffect?: boolean;
  bgPattern?: ImageSourcePropType;
  icon: ReactNode | null;
};

// ─── Static Data ─────────────────────────────────────────────────────────────

const INITIAL_SCENE_CARDS: TSceneCard[] = [
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
    key: 'power-off',
    title: 'Tắt toàn bộ thiết bị nhà',
    colSpan: 2, // full-width — chiếm toàn hàng
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
  const layout = useWindowDimensions();
  const [cards, setCards] = useState<TSceneCard[]>(INITIAL_SCENE_CARDS);

  // Map key → card để tra nhanh khi reorder
  const keyToCard = Object.fromEntries(cards.map(c => [c.key, c]));

  // Width cho half-width card (colSpan: 1)
  const halfWidth = (layout.width - BASE_SPACE_HORIZONTAL * 2 - GAP_DEVICE_VIEW_MOBILE) / 2;

  // onOrderChange nhận { indexToKey } = mảng key theo thứ tự mới
  const handleOrderChange = useCallback(
    ({ indexToKey }: OrderChangeParams) => {
      setCards(indexToKey.map(k => keyToCard[k]!));
    },
    [keyToCard],
  );

  const getCardStyle = useCallback(
    (card: TSceneCard): ViewStyle => ({
      width: card.colSpan === 2 ? '100%' : halfWidth,
    }),
    [halfWidth],
  );

  return (
    <ScrollView
      className={className}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* --- SORTABLE FLEX (MIXED LAYOUT) --- */}
      <View className="px-4">
        <Sortable.Flex
          onOrderChange={handleOrderChange}
          flexDirection="row"
          flexWrap="wrap"
          gap={GAP_DEVICE_VIEW_MOBILE}
        >
          {cards.map(card => (
            <PrimarySceneCard
              key={card.key}
              title={card.title}
              icon={card.icon}
              cardColor={card.cardColor}
              bgGradient={card.bgGradient}
              iconBgColor={card.iconBgColor}
              textColor={card.textColor}
              menuIconColor={card.menuIconColor}
              showGlossyEffect={card.showGlossyEffect}
              containerStyle={getCardStyle(card)}
            />
          ))}
        </Sortable.Flex>
      </View>

      {/* --- BANNER (FULL BỀ NGANG) — nằm ngoài Sortable --- */}
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

      {/* --- PHẦN ĐỀ XUẤT (RECOMMENDATION) — nằm ngoài Sortable --- */}
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
