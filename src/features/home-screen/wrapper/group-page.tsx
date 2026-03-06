import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { ETheme } from '@/types/base';
import { RoomTabItem } from '../components/tab/room-tab';

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

const MAX_WIDTH = 3 * (WIDTH - BASE_SPACE_HORIZONTAL * 2) / 4;

export const GroupPage = memo(({ group, theme }: { group: any; theme: ETheme }) => {
  const isFav = group.key === 'favorite';
  const rooms = ROOMS_DATA[group.key] || [];
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const isManualRoomScrollingRef = useRef(false);

  // Chỉ cần ScrollView thường là đủ
  const secondaryTabRef = useRef<ScrollView>(null);
  const innerScrollRef = useRef<ScrollView>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  const minWidths = useMemo(() => rooms.map(r => r.title.length * 8 + 42), [rooms]);

  // Hàm tính toán Center Offset tĩnh
  const calculateCenterOffset = useCallback((index: number, isExpandedState: boolean) => {
    let offset = 0;
    const gap = 8;
    for (let i = 0; i < index; i++) {
      offset += (isExpandedState ? MAX_WIDTH : minWidths[i]) + gap;
    }
    const currentWidth = isExpandedState ? MAX_WIDTH : minWidths[index];
    const centerOffset = offset + (currentWidth / 2) - (WIDTH / 2) + 16;
    return Math.max(0, centerOffset);
  }, [minWidths]);

  const toggleExpand = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState); // Đổi state -> RoomTabItem tự re-render -> Kích hoạt LinearTransition

    // Cho Native Scroll cuộn về vị trí trung tâm của Tab
    // Để 50ms delay để layout engine (Yoga) kịp bung chiều dài ScrollView ra
    setTimeout(() => {
      const targetOffset = calculateCenterOffset(activeRoomIdx, nextState);
      secondaryTabRef.current?.scrollTo({ x: targetOffset, animated: true });
    }, 50);
  };

  // Dùng onMomentumScrollEnd để chống nháy tab (Phantom Scroll)
  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualRoomScrollingRef.current)
      return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / WIDTH);

    if (index >= 0 && index < rooms.length && index !== activeRoomIdx) {
      setActiveRoomIdx(index);
      const targetOffset = calculateCenterOffset(index, isExpanded);
      secondaryTabRef.current?.scrollTo({ x: targetOffset, animated: true });
    }
  }, [rooms.length, activeRoomIdx, isExpanded, calculateCenterOffset]);

  const jumpToRoom = useCallback((idx: number) => {
    if (idx !== activeRoomIdx) {
      isManualRoomScrollingRef.current = true;
      setActiveRoomIdx(idx);
      innerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });

      const targetOffset = calculateCenterOffset(idx, isExpanded);
      secondaryTabRef.current?.scrollTo({ x: targetOffset, animated: true });
      setTimeout(() => {
        isManualRoomScrollingRef.current = false;
      }, 400);
    }
  }, [activeRoomIdx, isExpanded, calculateCenterOffset]);

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
                  isExpanded={isExpanded} // <--- Truyền state tĩnh thay vì sharedValue
                />
              ))}
            </View>
          </ScrollView>

          {/* Nút Chevron */}
          <View className="absolute top-0 right-4 z-10 h-[28px] items-center justify-center rounded-full bg-white/40 px-2 shadow-sm dark:bg-black/40">
            <Pressable onPress={toggleExpand} className="p-1">
              <FontAwesome6
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={theme === ETheme.Light ? '#737373' : '#FFFFFF'}
              />
            </Pressable>
          </View>
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
