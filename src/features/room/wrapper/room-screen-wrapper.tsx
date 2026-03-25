import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import Animated, {
  Easing,
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { Pressable, Text, TouchableOpacity, View, WIDTH } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';

import { RoomListPage } from '../components/room-list-page';

// ==========================================
// TABS GROUP DEFINITION
// ==========================================
type TGroup = {
  key: string;
  title: string;
  rooms: {
    id: string;
    name: string;
    sortOrder: number;
    homeId: string;
    floorId?: string;
    entities?: any[];
    scenes?: any[];
  }[];
};

export const RoomScreenWrapper = memo(({ className }: { className?: string }) => {
  const { theme } = useUniwind();
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0);
  const [isGrid, setIsGrid] = useState(true);

  // ─── Store data ──────────────────────────────
  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const floors = useHomeDataStore(s => s.floors);
  const allRooms = useHomeDataStore(s => s.rooms);

  // Build groups dynamically based on floor data
  const groups: TGroup[] = useMemo(() => {
    // 1. Static Home Tab (All Rooms)
    const homeGroup: TGroup = { key: 'home', title: translate('base.home', { defaultValue: 'Home' }), rooms: allRooms ?? [] };

    // 2. Floor Tabs
    const floorGroups: TGroup[] = (floors ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(f => ({
        key: f.id,
        title: f.name,
        rooms: f.rooms ?? [],
      }));

    // 3. Ungrouped Rooms Tab
    const floorRoomIds = new Set((floors ?? []).flatMap(f => f.rooms?.map(r => r.id) ?? []));
    const ungroupedRooms = allRooms?.filter(r => !floorRoomIds.has(r.id)) ?? [];

    if (ungroupedRooms.length > 0) {
      floorGroups.push({
        key: 'ungrouped',
        title: translate('base.ungroupedRooms', { defaultValue: 'Ungrouped' }),
        rooms: ungroupedRooms,
      });
    }

    return [homeGroup, ...floorGroups];
  }, [floors, allRooms]);

  // Reset floor index when home changes
  const prevHomeIdRef = useRef(selectedHomeId);
  if (prevHomeIdRef.current !== selectedHomeId) {
    prevHomeIdRef.current = selectedHomeId;
    if (currentFloorIdx !== 0) {
      setCurrentFloorIdx(0);
    }
  }

  // ─── Scroll & Animation states ──────────────────────────────
  const primaryTabRef = useAnimatedRef<Animated.ScrollView>();
  const outerScrollRef = useRef<ScrollView>(null);
  const isManualOuterScrollingRef = useRef(false);
  const primarySharedIdx = useSharedValue(0);

  useEffect(() => {
    primarySharedIdx.value = withTiming(currentFloorIdx, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
  }, [currentFloorIdx, primarySharedIdx]);

  useDerivedValue(() => {
    const targetX = Math.max(0, (primarySharedIdx.value - 2) * 100);
    scrollTo(primaryTabRef, targetX, 0, false);
  });

  const handleOuterScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualOuterScrollingRef.current)
      return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / WIDTH);

    if (index >= 0 && index < groups.length && index !== currentFloorIdx) {
      setCurrentFloorIdx(index);
    }
  }, [currentFloorIdx, groups.length]);

  const jumpToFloor = useCallback((idx: number) => {
    isManualOuterScrollingRef.current = true;
    setCurrentFloorIdx(idx);
    outerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });
    setTimeout(() => isManualOuterScrollingRef.current = false, 400);
  }, []);

  const toggleLayout = useCallback(() => setIsGrid(prev => !prev), []);

  return (
    <View className={cn('flex-1', className)}>
      {/* HEADER: Tab Tầng và Layout Toggle */}
      <View className="mb-2 flex-row items-center gap-1 px-2">
        {/* First Priority Tab: Home */}
        <Pressable onPress={() => jumpToFloor(0)} className="px-3">
          <Text className={cn(
            'h-8 text-lg font-normal text-neutral-500 dark:text-neutral-400',
            currentFloorIdx === 0 && 'font-bold text-neutral-700 dark:text-white',
          )}
          >
            {groups[0]?.title}
          </Text>
        </Pressable>

        <View className="h-8 flex-1">
          <Animated.ScrollView
            ref={primaryTabRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 4 }}
          >
            {groups.slice(1).map((group, offsetIdx) => {
              const realIdx = offsetIdx + 1;
              const focused = currentFloorIdx === realIdx;
              return (
                <Pressable key={group.key} onPress={() => jumpToFloor(realIdx)} className="px-3">
                  <Text className={cn(
                    'h-8 text-lg font-normal text-neutral-500 dark:text-neutral-400',
                    focused && 'font-bold text-neutral-700 dark:text-white',
                  )}
                  >
                    {group.title}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.ScrollView>
        </View>

        {/* Layout Toggle Button */}
        <TouchableOpacity
          onPress={toggleLayout}
          activeOpacity={0.7}
          className="mr-2 size-10 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40"
        >
          <MaterialCommunityIcons
            name={isGrid ? 'view-agenda-outline' : 'view-grid-outline'}
            size={20}
            color={theme === 'light' ? '#737373' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* NỘI DUNG CHÍNH: Outer ScrollView chứa các RoomListPage */}
      <View className="flex-1">
        <ScrollView
          ref={outerScrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={handleOuterScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          overScrollMode="never"
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1"
        >
          {groups.map(group => (
            <RoomListPage
              key={group.key}
              rooms={group.rooms}
              isGrid={isGrid}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
});
