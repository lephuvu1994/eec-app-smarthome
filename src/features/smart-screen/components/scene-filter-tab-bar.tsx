import { useCallback, useRef } from 'react';
import { FlatList, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { GAP_DEVICE_VIEW_MOBILE } from '@/constants';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TSceneFilterTab = {
  id: string; // 'favorite' | 'floor-1' | 'room-2'...
  label: string; // 'Yêu thích' | 'Tầng 1' | 'Phòng 2'...
};

type TProps = {
  tabs: TSceneFilterTab[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function SceneFilterTabBar({ tabs, selected, onToggle }: TProps) {
  const flatListRef = useRef<FlatList>(null);

  const renderItem = useCallback(
    ({ item }: { item: TSceneFilterTab }) => {
      const isActive = selected.has(item.id);
      return (
        <Pressable
          onPress={() => onToggle(item.id)}
          className={[
            'rounded-full px-3 items-center justify-center h-7',
            isActive
              ? 'bg-[#1B1B1B] dark:bg-white'
              : 'bg-[#F3F4F6] dark:bg-neutral-800',
          ].join(' ')}
        >
          <Text
            className={[
              'text-sm font-medium',
              isActive
                ? 'text-white dark:text-black'
                : 'text-[#6B7280] dark:text-neutral-400',
            ].join(' ')}
          >
            {item.label}
          </Text>
        </Pressable>
      );
    },
    [selected, onToggle],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={tabs}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 4,
        gap: GAP_DEVICE_VIEW_MOBILE,
      }}
    />
  );
}
