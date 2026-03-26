import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { ETheme } from '@/types/base';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View, WIDTH } from '@/components/ui';
import { ListDevice } from '@/features/devices/components/device-list';
import { useSmartTabBarHeight } from '@/hooks/use-smart-tabbar-height';
import { translate } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';
import { calculateCenterOffset } from '../../utils/utils';
import { RoomTabItem } from './room-tab';

type TGroupPageProps = {
  group: { key: string; title: string };
  rooms: { id: string; title: string }[];
  homeId: string;
  theme: ETheme;
  isCurrentGroup: boolean;
  /** Flat mode: mỗi group chỉ có 1 room, không render secondary tabs */
  isFlat?: boolean;
  targetRoomId?: string | null;
  onRoomNavigated?: () => void;
};

export const GroupPage = memo(({ group, rooms, homeId, theme, isCurrentGroup, isFlat, targetRoomId, onRoomNavigated }: TGroupPageProps) => {
  const isFav = group.key === 'favorite';
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const isManualRoomScrollingRef = useRef(false);
  const secondaryTabRef = useRef<ScrollView>(null);
  const showRoomViewExpand = useConfigManager(state => state.showRoomViewExpand);
  const heightBottomTab = useSmartTabBarHeight();

  // Chỉ cần ScrollView thường là đủ
  const innerScrollRef = useRef<ScrollView>(null);

  const minWidths = useMemo(() => rooms.map(r => r.title.length * 8 + 42), [rooms]);

  // Reset room index when rooms change (e.g. different floor)
  const prevRoomsRef = useRef(rooms);
  if (prevRoomsRef.current !== rooms) {
    prevRoomsRef.current = rooms;
    if (activeRoomIdx !== 0) {
      setActiveRoomIdx(0);
    }
  }

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
  }, [showRoomViewExpand, isCurrentGroup, activeRoomIdx, minWidths]);

  // Sync tab khi swipe content xong
  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualRoomScrollingRef.current)
      return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / WIDTH);

    if (index >= 0 && index < rooms.length) {
      setActiveRoomIdx(index);
      const targetOffset = calculateCenterOffset(minWidths, index, showRoomViewExpand);
      secondaryTabRef?.current?.scrollTo({ x: targetOffset, animated: true });
    }
  }, [rooms.length, secondaryTabRef, minWidths, showRoomViewExpand]);

  const jumpToRoom = useCallback((idx: number) => {
    isManualRoomScrollingRef.current = true;
    setActiveRoomIdx(idx);
    innerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });

    const targetOffset = calculateCenterOffset(minWidths, idx, showRoomViewExpand);
    secondaryTabRef?.current?.scrollTo({ x: targetOffset, animated: true });
    setTimeout(() => {
      isManualRoomScrollingRef.current = false;
    }, 400);
  }, [secondaryTabRef, showRoomViewExpand, minWidths]);

  // Auto-scroll đến room khi nhận targetRoomId từ menu
  useEffect(() => {
    if (!targetRoomId || !isCurrentGroup)
      return;
    const idx = rooms.findIndex(r => r.id === targetRoomId);
    if (idx >= 0) {
      // Delay nhẹ để đợi outer scroll view hoàn tất
      const timeout = setTimeout(() => {
        jumpToRoom(idx);
        onRoomNavigated?.();
      }, 450);
      return () => clearTimeout(timeout);
    }
  }, [targetRoomId, isCurrentGroup, rooms, jumpToRoom, onRoomNavigated]);

  return (
    <View style={{ width: WIDTH, flex: 1 }}>
      {/* THANH TAB PHỤ (SECONDARY TAB) — Ẩn khi flat mode */}
      {!isFav && !isFlat && rooms.length > 0 && (
        <View className="w-full">
          <ScrollView
            ref={secondaryTabRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              paddingHorizontal: 16,
            }}
          >
            {/* Vùng Flexbox chứa các Tab */}
            <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
              {rooms.map((room, idx) => (
                <RoomTabItem
                  key={room.id}
                  room={room}
                  focused={activeRoomIdx === idx}
                  theme={theme}
                  onPress={() => jumpToRoom(idx)}
                  isExpanded={showRoomViewExpand}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* DANH SÁCH PHÒNG (INNER CONTENT) */}
      <View className="flex-1">
        {isFav
          ? (
              <View style={{ width: WIDTH }} className="flex-1 px-4 pt-1">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  overScrollMode="never"
                  className="flex-1"
                  contentContainerStyle={{ flexGrow: 1, paddingBottom: heightBottomTab }}
                >
                  <View className="flex-1 gap-2">
                    <ListDevice isFavorite homeId={homeId} />
                  </View>
                </ScrollView>
              </View>
            )
          : isFlat && rooms.length > 0
            ? (
                // Flat mode: 1 room = 1 primary tab, render ListDevice trực tiếp
                <View style={{ width: WIDTH }} className="flex-1 px-4 pt-1">
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: heightBottomTab }}
                  >
                    <View className="flex-1 gap-2">
                      <ListDevice roomId={rooms[0]?.id} homeId={homeId} />
                    </View>
                  </ScrollView>
                </View>
              )
            : rooms.length === 0
              ? (
                  <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-neutral-400 dark:text-neutral-500">
                      {translate('base.noRoom')}
                    </Text>
                  </View>
                )
              : (
                  <ScrollView
                    ref={innerScrollRef}
                    horizontal
                    pagingEnabled
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScrollEnd}
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
                            <ListDevice roomId={item.id} homeId={homeId} />
                          </View>
                        </ScrollView>
                      </View>
                    ))}
                  </ScrollView>
                )}
      </View>
    </View>
  );
});
