import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Animated, { 
  Easing, 
  scrollTo, 
  useAnimatedRef, 
  useAnimatedStyle, 
  useDerivedValue, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useUniwind } from 'uniwind';

import { LiveCameraWrapper } from '@/components/base/LiveCameraWrapper';
import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { MenuNative, TItemMenu } from '@/components/ui/menu-native';
import { NativeButton } from '@/components/ui/native-button';
import { ANIMATION_DURATION, ASPECT_RATIO_VIDEO, BASE_SPACE_HORIZONTAL } from '@/constants';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useConfigManager } from '@/stores/config/config';
import { ETheme } from '@/types/base';
import { GroupPage } from './group-page';

// --- Cấu hình dữ liệu ---
const heightVideoOnScreen = ((WIDTH - BASE_SPACE_HORIZONTAL * 2) / ASPECT_RATIO_VIDEO);

const GROUPS = [
  { key: 'favorite', title: 'Favorite' },
  { key: 't1', title: 'Tầng 1' },
  { key: 't2', title: 'Tầng 2' },
  { key: 't3', title: 'Tầng 3' },
];


// ==========================================
// 2. MAIN WRAPPER COMPONENT (Lớp ngoài)
// Quản lý việc cuộn ngang giữa các tầng và Camera Preview
// ==========================================
export function HomeScreenWrapper({ className }: { className?: string }) {
  const { theme } = useUniwind();
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0);
  const showCameraPreview = useConfigManager(state => !state.showCameraPreview);
  const animatedHeight = useSharedValue(heightVideoOnScreen);
  
  const primaryTabRef = useAnimatedRef<Animated.ScrollView>();
  const outerScrollRef = useRef<ScrollView>(null);
  const isManualOuterScrolling = useRef(false);
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
  }, [currentFloorIdx]);

  // Cuộn thanh Tab chính dựa trên index hiện tại
  useDerivedValue(() => {
    const targetX = Math.max(0, (primarySharedIdx.value - 2) * 100);
    scrollTo(primaryTabRef, targetX, 0, false);
  });

  // Xử lý vuốt nội dung lớp ngoài để chuyển Tầng
  const handleOuterScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualOuterScrolling.current) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / WIDTH);

    if (index >= 0 && index < GROUPS.length && index !== currentFloorIdx) {
      setCurrentFloorIdx(index);
    }
  }, [currentFloorIdx]);

  // Điều hướng khi nhấn Tab Tầng
  const jumpToFloor = useCallback((idx: number) => {
    if (idx !== currentFloorIdx) {
      isManualOuterScrolling.current = true;
      setCurrentFloorIdx(idx);
      outerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });
      setTimeout(() => { isManualOuterScrolling.current = false; }, 400);
    }
  }, [currentFloorIdx]);

  const handleError = () => {
    animatedHeight.value = withTiming(animatedHeight.value > 0 ? 0 : heightVideoOnScreen, {
      duration: ANIMATION_DURATION,
    });
  };

  const listItem: TItemMenu[] = useMemo(() => [
    { key: 'managerScene', element: <NativeButton onPress={() => {}}>Manager</NativeButton> },
  ], []);

  return (
    <View className={cn('flex-1 gap-2', className)}>
      {/* Vùng xem Camera */}
      <Animated.View style={[animatedStyle]} className="w-full items-center justify-center overflow-hidden px-4">
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
      <View className="flex-row items-center gap-1 px-4">
        <Pressable onPress={() => jumpToFloor(0)} className="px-2">
          <Text className={cn(
            'h-8 text-lg font-normal text-neutral-500 dark:text-neutral-400', 
            currentFloorIdx === 0 && 'font-bold text-neutral-700 dark:text-white'
          )}>
            {translate('app.favoriteTab')}
          </Text>
        </Pressable>

        <View className="h-8 flex-1">
          <Animated.ScrollView 
            ref={primaryTabRef} 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ gap: 8 }}
          >
            {GROUPS.slice(1).map((group, offsetIdx) => {
              const realIdx = offsetIdx + 1;
              const focused = currentFloorIdx === realIdx;
              return (
                <Pressable key={group.key} onPress={() => jumpToFloor(realIdx)} className="px-2">
                  <Text className={cn(
                    'h-8 text-lg font-normal text-neutral-500 dark:text-neutral-400',
                    focused && 'font-bold text-neutral-700 dark:text-white'
                  )}>
                    {group.title}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.ScrollView>
        </View>

        <MenuNative 
          containerStyle={{ width: 32, height: 32 }} 
          triggerComponent={
            <View className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
              <MaterialIcons name="menu" size={16} color={theme === ETheme.Light ? '#737373' : '#FFF'} />
            </View>
          } 
          listItem={listItem} 
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
        >
          {GROUPS.map(group => (
            <GroupPage key={group.key} group={group} theme={theme as ETheme} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}