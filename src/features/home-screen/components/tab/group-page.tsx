import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, TouchableOpacity, View, WIDTH } from '@/components/ui';
import { useSmartTabBarHeight } from '@/hooks/use-smart-tabbar-height';
import { translate } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';
import { ETheme } from '@/types/base';
import { calculateCenterOffset } from '../../utils/utils';
import { ListDevice } from '../device/ListDevice';
import { RoomTabItem } from './room-tab';

const ROOMS_DATA: Record<string, { id: string; title: string }[]> = {
  favorite: [{ id: 'fav1', title: 'Thiết bị thường dùng' }],
  t1: [
    { id: 'r1', title: 'Phòng khách' },
    { id: 'r2', title: 'Phòng bếp' },
    { id: 'r3', title: 'Sân vườn' },
  ],
  t2: [
    { id: 'r4', title: 'Ngủ Master' },
    { id: 'r5', title: 'Phòng làm việc' },
  ],
  t3: [
    { id: 'r6', title: 'Phòng thờ' },
    { id: 'r7', title: 'Sân thượng' },
  ],
};

export const GroupPage = memo(({ group, theme, isCurrentGroup }: { group: any; theme: ETheme; isCurrentGroup: boolean }) => {
  const isFav = group.key === 'favorite';
  const rooms = ROOMS_DATA[group.key] || [];
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const isManualRoomScrollingRef = useRef(false);
  const secondaryTabRef = useRef<ScrollView>(null);
  const showRoomViewExpand = useConfigManager(state => state.showRoomViewExpand);
  const heightBottomTab = useSmartTabBarHeight();

  // Chỉ cần ScrollView thường là đủ
  const innerScrollRef = useRef<ScrollView>(null);

  const minWidths = useMemo(() => rooms.map(r => r.title.length * 8 + 42), [rooms]);

  useEffect(() => {
    if (isCurrentGroup) {
      const timeout = setTimeout(() => {
        const targetOffset = calculateCenterOffset(minWidths, activeRoomIdx, showRoomViewExpand);
        secondaryTabRef?.current?.scrollTo({ x: targetOffset, animated: true });
      }, 50);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [showRoomViewExpand, isCurrentGroup]);

  // Dùng onMomentumScrollEnd để chống nháy tab (Phantom Scroll)
  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualRoomScrollingRef.current)
      return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / WIDTH);

    if (index >= 0 && index < rooms.length && index !== activeRoomIdx) {
      setActiveRoomIdx(index);
      const targetOffset = calculateCenterOffset(minWidths, index, showRoomViewExpand);
      secondaryTabRef?.current?.scrollTo({ x: targetOffset, animated: true });
    }
  }, [rooms.length, secondaryTabRef, minWidths, activeRoomIdx, showRoomViewExpand]);

  const jumpToRoom = useCallback((idx: number) => {
    if (idx !== activeRoomIdx) {
      isManualRoomScrollingRef.current = true;
      setActiveRoomIdx(idx);
      innerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });

      const targetOffset = calculateCenterOffset(minWidths, idx, showRoomViewExpand);
      secondaryTabRef?.current?.scrollTo({ x: targetOffset, animated: true });
      setTimeout(() => {
        isManualRoomScrollingRef.current = false;
      }, 400);
    }
  }, [activeRoomIdx, secondaryTabRef, showRoomViewExpand, minWidths]);

  return (
    <View style={{ width: WIDTH, flex: 1 }}>
      {/* THANH TAB PHỤ (SECONDARY TAB) */}
      {!isFav && (
        <View className="w-full">
          <ScrollView
            ref={secondaryTabRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              paddingHorizontal: 16,
            }}
          >
            {/* Vùng Flexbox chứa các Tab (Layout Transitions sẽ đẩy các view này tự động) */}
            <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
              {rooms.map((room, idx) => (
                <RoomTabItem
                  key={room.id}
                  room={room}
                  focused={activeRoomIdx === idx}
                  theme={theme}
                  onPress={() => jumpToRoom(idx)}
                  isExpanded={showRoomViewExpand} // <--- Truyền state tĩnh thay vì sharedValue
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* DANH SÁCH PHÒNG (INNER CONTENT) */}
      <View className="flex-1">
        <ScrollView
          ref={innerScrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScrollEnd} // <--- Gọi ở đây để chống nháy
          scrollEventThrottle={16}
          decelerationRate="fast"
          overScrollMode="never"
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {rooms.map(item => (
            <View key={item.id} style={{ width: WIDTH }} className="px-4 pt-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: heightBottomTab }}
              >
                <View className="flex-1 gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold">{translate('base.device')}</Text>
                    <TouchableOpacity onPress={() => router.push('/device/add')} className="h-8 w-8 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
                      <AntDesign name="plus" size={16} color={theme === ETheme.Light ? '#737373' : '#FFFFFF'} />
                    </TouchableOpacity>
                  </View>
                  <ListDevice />
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});
