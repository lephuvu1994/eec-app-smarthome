import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { ETheme } from '@/types/base';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ScrollView } from 'react-native';
import Animated, {
  Easing,
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useUniwind } from 'uniwind';
import { LiveCameraWrapper } from '@/components/base/LiveCameraWrapper';
import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import { ANIMATION_DURATION, ASPECT_RATIO_VIDEO, BASE_SPACE_HORIZONTAL } from '@/constants';
import { GroupPage } from '@/features/home-screen/components/tab/group-page';
import { useHomeMenu } from '@/features/home-screen/hooks/use-home-menu';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';

// --- Cấu hình dữ liệu ---
const heightVideoOnScreen = ((WIDTH - BASE_SPACE_HORIZONTAL * 2) / ASPECT_RATIO_VIDEO);

type TGroup = {
  key: string;
  title: string;
  /** Pre-computed rooms for GroupPage (stable reference) */
  computedRooms: { id: string; title: string }[];
  /** Floor data — present when mode = grouped (has ≥1 floor) */
  floor?: { id: string; name: string; sortOrder: number; rooms?: { id: string; name: string; homeId: string; floorId?: string }[] };
  /** Room data — present when mode = flat (0 floors, each room is a primary tab) */
  rooms?: { id: string; title: string }[];
};

// ==========================================
// MAIN WRAPPER COMPONENT
// Quản lý việc cuộn ngang giữa các tầng và Camera Preview
// ==========================================
export const HomeScreenWrapper = memo(({ className }: { className?: string }) => {
  const { theme } = useUniwind();
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0);
  const [targetRoomId, setTargetRoomId] = useState<string | null>(null);
  const showCameraPreview = useConfigManager(state => !state.showCameraPreview);
  const animatedHeight = useSharedValue(heightVideoOnScreen);

  // ─── Store data ──────────────────────────────
  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const floors = useHomeDataStore(s => s.floors);
  const allRooms = useHomeDataStore(s => s.rooms);
  const syncFromAPI = useHomeDataStore(s => s.syncFromAPI);

  // Sync store khi người dùng chủ động đổi Home qua Dropdown (Bỏ qua lần render đầu do Splash Screen đã làm)
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (selectedHomeId) {
      void syncFromAPI(selectedHomeId);
      // Fetch devices thủ công thay vì dùng useHomeDevices để không đụng độ React Query Lifecycle
      void deviceService.getDevices({ homeId: selectedHomeId, limit: 50 }).then(res =>
        useDeviceStore.getState().setDevices(res.data),
      );
    }
  }, [selectedHomeId, syncFromAPI]);

  // Build groups dynamically based on floor data
  const groups: TGroup[] = useMemo(() => {
    const favoriteGroup: TGroup = { key: 'favorite', title: 'Favorite', computedRooms: [] };
    const hasFloors = !!floors?.length;

    if (!hasFloors) {
      // CASE 1: 0 floors → mỗi room = 1 primary tab (flat mode, no secondary tabs)
      if (!allRooms?.length)
        return [favoriteGroup];
      const roomGroups: TGroup[] = allRooms.map(r => ({
        key: r.id,
        title: r.name,
        computedRooms: [{ id: r.id, title: r.name }],
        rooms: [{ id: r.id, title: r.name }],
      }));
      return [favoriteGroup, ...roomGroups];
    }

    // CASE 2: ≥1 floor → floors = primary tabs, rooms = secondary tabs
    const floorGroups: TGroup[] = floors
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(f => ({
        key: f.id,
        title: f.name,
        computedRooms: f.rooms?.map(r => ({ id: r.id, title: r.name })) ?? [],
        floor: f,
      }));

    // Ungrouped rooms: rooms không thuộc floor nào
    const floorRoomIds = new Set(floors.flatMap(f => f.rooms?.map(r => r.id) ?? []));
    const ungroupedRooms = allRooms?.filter(r => !floorRoomIds.has(r.id)) ?? [];

    if (ungroupedRooms.length > 0) {
      floorGroups.push({
        key: 'ungrouped',
        title: translate('base.ungroupedRooms'),
        computedRooms: ungroupedRooms.map(r => ({ id: r.id, title: r.name })),
        floor: {
          id: 'ungrouped',
          name: translate('base.ungroupedRooms'),
          sortOrder: 999,
          rooms: ungroupedRooms,
        },
      });
    }

    return [favoriteGroup, ...floorGroups];
  }, [floors, allRooms]);

  // ─── Group keys cho menu hook ───────
  const groupKeys = useMemo(() => groups.map(g => g.key), [groups]);

  // Reset floor index when home changes
  const prevHomeIdRef = useRef(selectedHomeId);
  if (prevHomeIdRef.current !== selectedHomeId) {
    prevHomeIdRef.current = selectedHomeId;
    if (currentFloorIdx !== 0) {
      setCurrentFloorIdx(0);
    }
  }

  const primaryTabRef = useAnimatedRef<Animated.ScrollView>();
  const outerScrollRef = useRef<ScrollView>(null);
  const isManualOuterScrollingRef = useRef(false);
  const primarySharedIdx = useSharedValue(0);

  // Animation cho Camera Preview
  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(showCameraPreview ? heightVideoOnScreen : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.ease),
    }),
  }));

  // Đồng bộ hóa Shared Value để thực hiện scrollTo mượt mà
  useEffect(() => {
    primarySharedIdx.value = withTiming(currentFloorIdx, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
  }, [currentFloorIdx, primarySharedIdx]);

  // Cuộn thanh Tab chính dựa trên index hiện tại
  useDerivedValue(() => {
    const targetX = Math.max(0, (primarySharedIdx.value - 2) * 100);
    scrollTo(primaryTabRef, targetX, 0, false);
  });

  // Xử lý vuốt nội dung lớp ngoài để chuyển Tầng
  const handleOuterScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualOuterScrollingRef.current)
      return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / WIDTH);

    if (index >= 0 && index < groups.length && index !== currentFloorIdx) {
      setCurrentFloorIdx(index);
    }
  }, [currentFloorIdx, groups.length]);

  // Điều hướng khi nhấn Tab Tầng
  const jumpToFloor = useCallback((idx: number) => {
    isManualOuterScrollingRef.current = true;
    setCurrentFloorIdx(idx);
    outerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });
    setTimeout(() => isManualOuterScrollingRef.current = false, 400);
  }, []);

  // ─── Navigation: bấm room trong menu → cuộn đến group + room ───────
  const navigateToRoom = useCallback((groupIdx: number, roomId: string) => {
    jumpToFloor(groupIdx);
    setTargetRoomId(roomId);
  }, [jumpToFloor]);

  const handleRoomNavigated = useCallback(() => {
    setTargetRoomId(null);
  }, []);

  // ─── Menu elements từ hook ───────
  const menuElements = useHomeMenu({
    floors,
    allRooms,
    groupKeys,
    onNavigateToRoom: navigateToRoom,
  });

  const handleError = () => {
    animatedHeight.value = withTiming(animatedHeight.value > 0 ? 0 : heightVideoOnScreen, {
      duration: ANIMATION_DURATION,
    });
  };

  return (
    <View className={cn('flex-1', className)}>
      {/* Vùng xem Camera */}
      <Animated.View style={[animatedStyle]} className="mb-2 w-full items-center justify-center overflow-hidden px-4">
        {showCameraPreview && (
          <View className="size-full flex-row justify-between overflow-hidden rounded-2xl">
            <LiveCameraWrapper
              videoUrl="rtsp://admin:EEVN1234%40@vanphongeec.ddns.net:1024/Streaming/channels/201"
              handleError={handleError}
            />
          </View>
        )}
      </Animated.View>

      {/* HEADER: Tab Tầng và Favorite */}
      <View className="flex-row items-center gap-1 px-2">
        <Pressable onPress={() => jumpToFloor(0)} className="px-1">
          <Text className={cn(
            'h-8 text-lg font-normal text-neutral-500 dark:text-neutral-400',
            currentFloorIdx === 0 && 'font-bold text-neutral-700 dark:text-white',
          )}
          >
            {translate('app.favoriteTab')}
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
                <Pressable key={group.key} onPress={() => jumpToFloor(realIdx)} className="px-2">
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

        {/* UI nút menu room */}
        <ZeegoNativeMenu
          triggerComponent={(
            <View pointerEvents="none" className="size-8 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
              <FontAwesome6 name="sliders" size={14} color={theme === 'light' ? '#737373' : '#FFFFFF'} />
            </View>
          )}
          elements={menuElements}
        />
      </View>

      {/* NỘI DUNG CHÍNH: Outer ScrollView chứa các FloorPage */}
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
          {groups.map((group) => {
            const rooms = group.computedRooms;
            const isCurrentGroup = groups[currentFloorIdx]?.key === group.key;
            return (
              <GroupPage
                isCurrentGroup={isCurrentGroup}
                isFlat={!!group.rooms}
                key={group.key}
                group={group}
                rooms={rooms}
                homeId={selectedHomeId ?? ''}
                theme={theme as ETheme}
                targetRoomId={isCurrentGroup ? targetRoomId : null}
                onRoomNavigated={handleRoomNavigated}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
});
