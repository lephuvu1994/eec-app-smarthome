import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, View, WIDTH } from '@/components/ui';
import { useConfigManager } from '@/stores/config/config';
import { ETheme } from '@/types/base';
import { RoomTabItem } from '../components/tab/room-tab';
import { calculateCenterOffset } from '../utils/utils';

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
  const { showRoomViewExpand } = useConfigManager();

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
        <View className="mb-4 px-4">
          <ScrollView
            ref={secondaryTabRef}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {/* Vùng Flexbox chứa các Tab (Layout Transitions sẽ đẩy các view này tự động) */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
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
        >
          {rooms.map(item => (
            <View key={item.id} style={{ width: WIDTH }} className="px-4 pb-4">
              <ScrollView
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                className="flex-1 overflow-hidden rounded-[32px] bg-black/5 dark:bg-white/10"
              >
                <View className="items-center p-6">
                  <MaterialIcons
                    name={isFav ? 'star' : 'door-front'}
                    size={40}
                    color={isFav ? '#F59E0B' : (theme === ETheme.Light ? '#737373' : '#FFF')}
                  />
                  <Text className="mt-2 text-xl font-bold dark:text-white">{item.title}</Text>
                </View>

                {/* Danh sách thiết bị */}
                <View className="gap-3 px-4 pb-6">
                  {[1, 2, 3, 4, 5, 6].map(device => (
                    <View key={device} className="h-20 flex-row items-center rounded-2xl bg-white px-4 shadow-sm dark:bg-black/20">
                      <View className="mr-4 size-10 rounded-full bg-[#A3E635]" />
                      <View>
                        <Text className="text-base font-bold dark:text-white">
                          Thiết bị
                          {' '}
                          {device}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});
