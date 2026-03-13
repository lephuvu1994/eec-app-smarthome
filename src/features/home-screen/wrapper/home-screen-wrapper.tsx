import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { TFloor } from '@/lib/api/homes/home.service';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';

import Animated, {
  Easing,
  interpolate,
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useUniwind } from 'uniwind';
import { LiveCameraWrapper } from '@/components/base/LiveCameraWrapper';
import { Pressable, Skeleton, Text, View, WIDTH } from '@/components/ui';
import { ANIMATION_DURATION, ASPECT_RATIO_VIDEO, BASE_SPACE_HORIZONTAL } from '@/constants';
import { useFloors } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useConfigManager } from '@/stores/config/config';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';
import { GroupPage } from '../components/tab/group-page';

// --- Cấu hình dữ liệu ---
const heightVideoOnScreen = ((WIDTH - BASE_SPACE_HORIZONTAL * 2) / ASPECT_RATIO_VIDEO);

type TGroup = {
  key: string;
  title: string;
  floor?: TFloor;
};

// ==========================================
// MAIN WRAPPER COMPONENT
// Quản lý việc cuộn ngang giữa các tầng và Camera Preview
// ==========================================
export const HomeScreenWrapper = memo(({ className }: { className?: string }) => {
  const { theme } = useUniwind();
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0);
  const showCameraPreview = useConfigManager(state => !state.showCameraPreview);
  const animatedHeight = useSharedValue(heightVideoOnScreen);
  const showRoomViewExpand = useConfigManager(state => state.showRoomViewExpand);
  const setShowRoomViewExpand = useConfigManager(state => state.setShowRoomViewExpand);

  // ─── API data ──────────────────────────────
  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const { data: floors, isLoading: isLoadingFloors } = useFloors(selectedHomeId ?? '');

  // Build groups dynamically: Favorite + Floors from API
  const groups: TGroup[] = useMemo(() => {
    const favoriteGroup: TGroup = { key: 'favorite', title: 'Favorite' };
    if (!floors?.length) return [favoriteGroup];
    const floorGroups: TGroup[] = floors
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(f => ({ key: f.id, title: f.name, floor: f }));
    return [favoriteGroup, ...floorGroups];
  }, [floors]);

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
    if (idx !== currentFloorIdx) {
      isManualOuterScrollingRef.current = true;
      setCurrentFloorIdx(idx);
      outerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });
      setTimeout(() => isManualOuterScrollingRef.current = false, 400);
    }
  }, [currentFloorIdx]);

  const handleError = () => {
    animatedHeight.value = withTiming(animatedHeight.value > 0 ? 0 : heightVideoOnScreen, {
      duration: ANIMATION_DURATION,
    });
  };

  const toggleExpand = () => {
    const nextState = !showRoomViewExpand;
    setShowRoomViewExpand(nextState);
  };

  // Shared value để tracking trạng thái xoay
  const rotateProgress = useDerivedValue(() => {
    return withTiming(showRoomViewExpand ? 1 : 0, { duration: 300 });
  });

  const arrowStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotateProgress.value,
      [0, 1],
      [-90, 0],
    );
    return {
      transform: [{ rotate: `${rotateValue}deg` }],
    };
  });

  return (
    <View className={cn('flex-1', className)}>
      {/* Vùng xem Camera */}
      <Animated.View style={[animatedStyle]} className="mb-2 w-full items-center justify-center overflow-hidden px-4">
        {showCameraPreview && (
          <View className="h-full w-full flex-row justify-between">
            <LiveCameraWrapper
              videoUrl="rtsp://admin:EEVN1234%40@vanphongeec.ddns.net:1024/Streaming/channels/201"
              defaultImage=""
              handleError={handleError}
            />
          </View>
        )}
      </Animated.View>

      {/* HEADER: Tab Tầng và Favorite */}
      <View className="flex-row items-center px-2">
        <Pressable onPress={() => jumpToFloor(0)} className="px-2">
          <Text className={cn(
            'h-8 text-lg font-normal text-neutral-500 dark:text-neutral-400',
            currentFloorIdx === 0 && 'font-bold text-neutral-700 dark:text-white',
          )}
          >
            {translate('app.favoriteTab')}
          </Text>
        </Pressable>

        <View className="h-8 flex-1">
          {isLoadingFloors
            ? (
                <View className="flex-1 flex-row items-center gap-2">
                  <Skeleton width={60} height={24} borderRadius={8} />
                  <Skeleton width={60} height={24} borderRadius={8} />
                  <Skeleton width={60} height={24} borderRadius={8} />
                </View>
              )
            : (
                <Animated.ScrollView
                  ref={primaryTabRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
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
              )}
        </View>

        {/* Nút Chevron */}
        <Pressable onPress={toggleExpand} className="mr-2 h-7 items-center justify-center rounded-full bg-white/40 px-2 shadow-sm dark:bg-black/40">
          <Animated.View style={[arrowStyle]}>
            <FontAwesome6
              name="chevron-down"
              size={12}
              color={theme === ETheme.Light ? '#737373' : '#FFFFFF'}
            />
          </Animated.View>
        </Pressable>
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
            const rooms = group.floor?.rooms?.map(r => ({ id: r.id, title: r.name })) ?? [];
            return (
              <GroupPage
                isCurrentGroup={groups[currentFloorIdx]?.key === group.key}
                key={group.key}
                group={group}
                rooms={rooms}
                homeId={selectedHomeId ?? ''}
                theme={theme as ETheme}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
});
