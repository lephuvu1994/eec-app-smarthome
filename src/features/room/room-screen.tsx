import type { TRoom } from '@/types/home';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
  SharedTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { Pressable, Text, TouchableOpacity, View, WIDTH } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useHomeDataStore } from '@/stores/home/home-data-store';

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

const DEFAULT_ROOM_IMAGE = require('@@/assets/room/default_image.webp');

// --- Layout constants ---
const CARD_GAP = GAP_DEVICE_VIEW_MOBILE;
const CARD_RADIUS = 24;
const GRID_CARD_WIDTH = (WIDTH - 2 * BASE_SPACE_HORIZONTAL - CARD_GAP) / 2;
const LIST_CARD_WIDTH = WIDTH - 2 * BASE_SPACE_HORIZONTAL;
const CARD_HEIGHT = GRID_CARD_WIDTH; // Square in grid, same height in list

// --- Animation configs ---
const roomTransition = SharedTransition.duration(500).easing(Easing.out(Easing.cubic));
const TIMING_CONFIG = { duration: 250, easing: Easing.out(Easing.quad) };
const layoutTransition = LinearTransition.duration(250).easing(Easing.out(Easing.quad));

type TGroup = {
  key: string;
  title: string;
  rooms: TRoom[];
};

// --- Animated Room Card ---
function RoomCard({ room, isGrid }: { room: TRoom; isGrid: boolean }) {
  const router = useRouter();
  const deviceCount = room.entities?.length ?? 0;

  // Animate only width — height stays fixed
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isGrid ? GRID_CARD_WIDTH : LIST_CARD_WIDTH, TIMING_CONFIG),
    };
  }, [isGrid]);

  const currentWidth = isGrid ? GRID_CARD_WIDTH : LIST_CARD_WIDTH;

  return (
    <Animated.View
      layout={layoutTransition}
      style={[
        {
          height: CARD_HEIGHT,
          borderRadius: CARD_RADIUS,
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={() => router.push(`./${room.id}`)}
        className="size-full"
      >
        <AnimatedExpoImage
          sharedTransitionTag={`room-img-${room.id}`}
          sharedTransitionStyle={roomTransition}
          source={DEFAULT_ROOM_IMAGE}
          style={{
            width: currentWidth,
            height: CARD_HEIGHT,
            borderRadius: CARD_RADIUS,
          }}
          contentFit="cover"
        />
        {/* Overlay */}
        <View className="absolute inset-0 bg-black/30">
          {/* Top action buttons — heart left, power right */}
          <View className="flex-row items-start justify-between p-3">
            <Pressable
              onPress={(e) => { e.stopPropagation(); }}
              className="size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
            >
              <MaterialCommunityIcons name="heart-outline" size={16} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={(e) => { e.stopPropagation(); }}
              className="size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
            >
              <MaterialCommunityIcons name="power" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Bottom details */}
          <View className="absolute inset-x-0 bottom-0 p-4">
            <Text className="text-lg font-bold text-white" numberOfLines={1}>
              {room.name}
            </Text>
            <Text className="mt-0.5 text-xs text-white/70">
              {deviceCount}
              {' '}
              {translate('room.device', { count: deviceCount, defaultValue: deviceCount === 1 ? 'Device' : 'Devices' })}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// --- Main Screen ---
export function RoomScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const [currentFloorIdx, setCurrentFloorIdx] = useState(0);
  const [isGrid, setIsGrid] = useState(true);

  const floors = useHomeDataStore(s => s.floors);
  const allRooms = useHomeDataStore(s => s.rooms);

  const groups: TGroup[] = useMemo(() => {
    const homeGroup: TGroup = {
      key: 'home',
      title: translate('base.home', { defaultValue: 'Home' }),
      rooms: allRooms ?? [],
    };
    const floorGroups: TGroup[] = (floors ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(f => ({ key: f.id, title: f.name, rooms: f.rooms ?? [] }));

    const floorRoomIds = new Set((floors ?? []).flatMap(f => f.rooms?.map(r => r.id) ?? []));
    const ungrouped = allRooms?.filter(r => !floorRoomIds.has(r.id)) ?? [];
    if (ungrouped.length > 0) {
      floorGroups.push({ key: 'ungrouped', title: translate('base.ungroupedRooms', { defaultValue: 'Ungrouped' }), rooms: ungrouped });
    }
    return [homeGroup, ...floorGroups];
  }, [floors, allRooms]);

  const currentRooms = groups[currentFloorIdx]?.rooms ?? [];

  return (
    <View className="flex-1">
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{ paddingTop: insets.top + 4 }}
        className="px-4 pb-2"
      >
        <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
          {translate('app.roomTab', { defaultValue: 'Rooms' })}
        </Text>
      </Animated.View>

      {/* Floor tabs + layout toggle */}
      <View className="mb-2 flex-row items-center gap-1 px-2">
        {groups.map((group, idx) => (
          <Pressable key={group.key} onPress={() => setCurrentFloorIdx(idx)} className="px-3">
            <Text
              className={cn(
                'h-8 text-base font-normal text-neutral-500 dark:text-neutral-400',
                currentFloorIdx === idx && 'font-bold text-neutral-700 dark:text-white',
              )}
            >
              {group.title}
            </Text>
          </Pressable>
        ))}
        <View className="flex-1" />
        <TouchableOpacity
          onPress={() => setIsGrid(prev => !prev)}
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

      {/* Room cards — flexWrap for smooth grid/list animation */}
      <ScrollView
        contentContainerStyle={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingHorizontal: BASE_SPACE_HORIZONTAL,
          gap: CARD_GAP,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {currentRooms.map(room => (
          <RoomCard key={room.id} room={room} isGrid={isGrid} />
        ))}
      </ScrollView>
    </View>
  );
}
