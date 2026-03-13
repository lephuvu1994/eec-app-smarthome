import { useCallback, useRef } from 'react';
import { FlatList, Pressable } from 'react-native';
import { Text, View } from '@/components/ui';
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

// ─── Default tabs (sẽ merge với data từ API) ─────────────────────────────────

export const DEFAULT_FILTER_TABS: TSceneFilterTab[] = [
  { id: 'favorite', label: 'Yêu thích' },
  { id: 'floor-1', label: 'Tầng 1' },
  { id: 'floor-2', label: 'Tầng 2' },
  { id: 'floor-3', label: 'Tầng 3' },
  { id: 'room-living', label: 'Phòng khách' },
  { id: 'room-bed', label: 'Phòng ngủ' },
  { id: 'room-kitchen', label: 'Bếp' },
];

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
            'mr-2 rounded-full px-4 py-2',
            isActive
              ? 'bg-[#1B1B1B]'
              : 'bg-[#F3F4F6]',
          ].join(' ')}
        >
          <Text
            className={[
              'text-sm font-medium',
              isActive ? 'text-white' : 'text-[#6B7280]',
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
    <View className="mb-3">
      <FlatList
        ref={flatListRef}
        data={tabs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 4,
          gap: GAP_DEVICE_VIEW_MOBILE,
        }}
      />
    </View>
  );
}
