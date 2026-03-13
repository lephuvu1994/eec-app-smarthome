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
};

type TProps = {
  initialCards: TSceneCard[];
  /** Nếu truyền vào → card có thể press được (tap-to-run). Nếu undefined → không press (automation) */
  onCardPress?: (card: TSceneCard) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SortableSceneGrid({ initialCards, onCardPress }: TProps) {
  const layout = useWindowDimensions();
  const [cards, setCards] = useState<TSceneCard[]>(initialCards);

  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const fullWidth = layout.width - BASE_SPACE_HORIZONTAL * 2;
  const halfWidth = (fullWidth - GAP_DEVICE_VIEW_MOBILE) / 2;

  const handleOrderChange = useCallback(({ indexToKey }: OrderChangeParams) => {
    const currentKeyToCard = Object.fromEntries(cardsRef.current.map(c => [c.key, c]));
    const reordered = indexToKey.map(k => currentKeyToCard[k]).filter(Boolean) as TSceneCard[];
    if (reordered.length > 0) {
      setCards(reordered);
    }
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
        flexDirection="row"
        flexWrap="wrap"
        gap={GAP_DEVICE_VIEW_MOBILE}
        showDropIndicator
        dropIndicatorStyle={{
          backgroundColor: '#F9FAFB',
          borderColor: colors.primaryActive,
        }}
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
            onPress={onCardPress ? () => onCardPress(card) : undefined}
          />
        ))}
      </Sortable.Flex>
    </View>
  );
}
