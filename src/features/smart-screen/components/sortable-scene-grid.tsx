import type { ReactNode } from 'react';
import type { ImageSourcePropType, ViewStyle } from 'react-native';
import { useCallback, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import Sortable from 'react-native-sortables';
import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';
import { colors, showErrorMessage, View } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { translate } from '@/lib/i18n';

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
  isDisabled?: boolean;
};

type TProps = {
  /** Cards data — quản lý bởi wrapper, grid chỉ render */
  cards: TSceneCard[];
  /** Set các filter đang được chọn. Nếu empty → show tất cả */
  activeFilters?: Set<string>;
  /** Nếu truyền vào → card có thể press được (tap-to-run). Nếu undefined → không press (automation) */
  onCardPress?: (card: TSceneCard) => void;
  onCardAction?: (action: 'delay' | 'edit' | 'delete', card: TSceneCard) => void;
  /** Callback khi user kéo thả xong → trả về mảng key[] theo thứ tự mới */
  onReorder?: (orderedKeys: string[]) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SortableSceneGrid({ cards, activeFilters, onCardPress, onCardAction, onReorder }: TProps) {
  const layout = useWindowDimensions();

  // Ref giữ data latest cho callback
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  // Track drag state để tránh onPress fire sau khi drag xong
  const isDraggingRef = useRef(false);

  const fullWidth = layout.width - BASE_SPACE_HORIZONTAL * 2;
  const halfWidth = (fullWidth - GAP_DEVICE_VIEW_MOBILE) / 2;

  // ── Filter logic ──────────────────────────────────────────────────────────
  const visibleCards = useMemo(() => {
    if (!activeFilters || activeFilters.size === 0)
      return cards;
    return cards.filter(card =>
      !card.filterTags
      || card.filterTags.some(tag => activeFilters.has(tag)),
    );
  }, [cards, activeFilters]);

  const handleOrderChange = useCallback(({ indexToKey }: { indexToKey: string[] }) => {
    if (onReorder && indexToKey.length > 0) {
      onReorder(indexToKey);
    }
  }, [onReorder]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 200);
  }, []);

  // Memo 2 style objects riêng thay vì tạo closure mỗi render
  const fullStyle = useMemo<ViewStyle>(() => ({ width: fullWidth }), [fullWidth]);
  const halfStyle = useMemo<ViewStyle>(() => ({ width: halfWidth }), [halfWidth]);

  const handleDisabledPress = useCallback(() => {
    showErrorMessage(translate('scenes.builder.errors.noActionsConfigured' as any));
  }, []);

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
            containerStyle={card.colSpan === 2 ? fullStyle : halfStyle}
            disabled={card.isDisabled}
            onDisabledPress={handleDisabledPress}
            onPress={onCardPress
              ? () => {
                  if (!isDraggingRef.current) {
                    onCardPress(card);
                  }
                }
              : undefined}
            onDelayPress={onCardAction ? () => onCardAction('delay', card) : undefined}
            onEditPress={onCardAction ? () => onCardAction('edit', card) : undefined}
            onDeletePress={onCardAction ? () => onCardAction('delete', card) : undefined}
          />
        ))}
      </Sortable.Flex>
    </View>
  );
}
