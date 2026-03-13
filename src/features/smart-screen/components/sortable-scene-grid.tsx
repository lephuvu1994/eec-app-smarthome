import type { ReactNode } from 'react';
import type { ImageSourcePropType, ViewStyle } from 'react-native';
import type { OrderChangeParams } from 'react-native-sortables';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import Sortable from 'react-native-sortables';
import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';
import { colors, View } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE } from '@/constants';

// ─── Types (re-export để dùng ở cả 2 wrapper) ────────────────────────────────

export type TSceneCard = {
  key: string;
  title: string;
  colSpan: 1 | 2;
  cardColor?: string;
  bgGradient?: [string, string];
  iconBgColor?: string;
  textColor?: string;
  menuIconColor?: string;
  showGlossyEffect?: boolean;
  bgPattern?: ImageSourcePropType;
  icon: ReactNode | null;
  /**
   * Danh sách filter tags card thuộc về.
   * VD: ['favorite'] | ['floor-1'] | ['room-bed', 'floor-2']
   * Nếu undefined → luôn hiển thị (không thuộc filter nào)
   */
  filterTags?: string[];
};

type TProps = {
  initialCards: TSceneCard[];
  /** Set các filter đang được chọn. Nếu empty → show tất cả */
  activeFilters?: Set<string>;
  /** Nếu truyền vào → card có thể press được (tap-to-run). Nếu undefined → không press (automation) */
  onCardPress?: (card: TSceneCard) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SortableSceneGrid({ initialCards, activeFilters, onCardPress }: TProps) {
  const layout = useWindowDimensions();
  const [cards, setCards] = useState<TSceneCard[]>(initialCards);

  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  // Track drag state để tránh onPress fire sau khi drag xong
  const isDraggingRef = useRef(false);

  const fullWidth = layout.width - BASE_SPACE_HORIZONTAL * 2;
  const halfWidth = (fullWidth - GAP_DEVICE_VIEW_MOBILE) / 2;

  // ── Filter logic ──────────────────────────────────────────────────────────
  // Nếu không có filter nào active → show tất cả
  // Nếu có filter → show card không có filterTags (luôn show) + card match bất kỳ filter nào
  const visibleCards = useMemo(() => {
    if (!activeFilters || activeFilters.size === 0)
      return cards;
    return cards.filter(card =>
      !card.filterTags // không có tag → luôn show
      || card.filterTags.some(tag => activeFilters.has(tag)),
    );
  }, [cards, activeFilters]);

  const handleOrderChange = useCallback(({ indexToKey }: OrderChangeParams) => {
    const currentKeyToCard = Object.fromEntries(cardsRef.current.map(c => [c.key, c]));
    const reordered = indexToKey.map(k => currentKeyToCard[k]).filter(Boolean) as TSceneCard[];
    if (reordered.length > 0) {
      setCards(reordered);
    }
  }, []);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 200);
  }, []);

  const getCardStyle = useMemo(
    () => (card: TSceneCard): ViewStyle => ({
      width: card.colSpan === 2 ? fullWidth : halfWidth,
    }),
    [fullWidth, halfWidth],
  );

  return (
    <View className="px-4">
      <Sortable.Flex
        onOrderChange={handleOrderChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        flexDirection="row"
        flexWrap="wrap"
        gap={GAP_DEVICE_VIEW_MOBILE}
        showDropIndicator
        dropIndicatorStyle={{
          backgroundColor: '#F9FAFB',
          borderColor: colors.primaryActive,
        }}
      >
        {visibleCards.map(card => (
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
            onPress={onCardPress
              ? () => {
                  if (!isDraggingRef.current) {
                    onCardPress(card);
                  }
                }
              : undefined}
          />
        ))}
      </Sortable.Flex>
    </View>
  );
}
