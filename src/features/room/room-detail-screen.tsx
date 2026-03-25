import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import Animated, { Easing, FadeInDown, FadeInLeft, FadeInRight, SharedTransition, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { useHomeDataStore } from '@/stores/home/home-data-store';

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

const DEFAULT_ROOM_IMAGE = require('@@/assets/room/default_image.webp');

const SHARED_ELEMENT_TRANSITION_DELAY = 500;
// Must match source transition for consistent animation
const roomTransition = SharedTransition.duration(SHARED_ELEMENT_TRANSITION_DELAY).easing(Easing.out(Easing.cubic));

const HERO_HEIGHT = WIDTH * 9 / 16;
const TRANSITION_DELAY = 250;

export function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const roomId = id as string;

  // Get room data from store
  const room = useHomeDataStore(s => s.rooms?.find(r => r.id === roomId));
  const roomName = room?.name ?? translate('room.defaultName', { defaultValue: 'Room' });
  const deviceCount = room?.entities?.length ?? 0;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Hero image — DIRECT child for correct shared element position */}
      <AnimatedExpoImage
        sharedTransitionTag={`room-img-${roomId}`}
        sharedTransitionStyle={roomTransition}
        source={DEFAULT_ROOM_IMAGE}
        style={{ width: WIDTH, height: HERO_HEIGHT, borderRadius: 0 }}
        contentFit="cover"
      />

      {/* Dark gradient overlay — fades in after transition */}
      <Animated.View
        entering={FadeInDown.duration(250).delay(SHARED_ELEMENT_TRANSITION_DELAY)}
        className="absolute inset-x-0 top-0 h-36"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1 }}
        pointerEvents="none"
      />

      {/* Back button + Room Name — absolute overlay */}
      <View
        style={{ paddingTop: Math.max(insets.top, 24), zIndex: 10 }}
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4"
      >
        <Animated.View entering={FadeInLeft.delay(SHARED_ELEMENT_TRANSITION_DELAY)}>
          <Pressable
            onPress={() => router.back()}
            className="size-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(SHARED_ELEMENT_TRANSITION_DELAY)}
          className="text-lg font-semibold text-white shadow-sm"
          numberOfLines={1}
        >
          {roomName}
        </Animated.Text>

        <Animated.View entering={FadeInRight.delay(SHARED_ELEMENT_TRANSITION_DELAY)}>
          <Pressable className="size-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md">
            <MaterialCommunityIcons name="dots-vertical" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>

      {/* Quick action buttons — bottom of hero */}
      <Animated.View
        entering={SlideInRight.duration(400).delay(TRANSITION_DELAY + 100)}
        style={{ top: HERO_HEIGHT - 60 }}
        className="absolute right-4 z-10 flex-row gap-3"
      >
        <Pressable className="size-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-md">
          <MaterialCommunityIcons name="power" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable className="size-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-md">
          <MaterialCommunityIcons name="heart-outline" size={20} color="#EF4444" />
        </Pressable>
        <Pressable className="size-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-md">
          <MaterialCommunityIcons name="share-variant-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      {/* Content area — overlaps hero for rounded top effect */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(TRANSITION_DELAY + 50)}
        className="-mt-6 flex-1 rounded-t-3xl bg-neutral-100 dark:bg-neutral-900"
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Room title section */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
                {roomName}
              </Text>
              <Text className="mt-1 text-sm text-neutral-500">
                {deviceCount}
                {' '}
                {translate('room.device', { count: deviceCount, defaultValue: deviceCount === 1 ? 'Device' : 'Devices' })}
              </Text>
            </View>
            <Pressable className="size-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800">
              <MaterialCommunityIcons name="pencil-outline" size={18} color="#999" />
            </Pressable>
          </View>

          {/* Scenes section */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              {translate('room.scenes', { defaultValue: 'Scenes' })}
            </Text>
            <View className="flex-row gap-3">
              {['Morning', 'Night', 'Movie'].map(scene => (
                <Pressable
                  key={scene}
                  className="flex-1 items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800"
                >
                  <MaterialCommunityIcons
                    name={scene === 'Morning' ? 'weather-sunny' : scene === 'Night' ? 'weather-night' : 'movie-open-outline'}
                    size={24}
                    color="#F59E0B"
                  />
                  <Text className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {scene}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Devices section */}
          <View>
            <Text className="mb-3 text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              {translate('room.devices', { defaultValue: 'Devices' })}
            </Text>
            {deviceCount === 0
              ? (
                  <View className="items-center rounded-2xl bg-white p-8 dark:bg-neutral-800">
                    <MaterialCommunityIcons name="devices" size={40} color="#999" />
                    <Text className="mt-3 text-sm text-neutral-500">
                      {translate('room.noDevices', { defaultValue: 'No devices in this room yet' })}
                    </Text>
                  </View>
                )
              : (
                  <View className="gap-3">
                    {room?.entities?.slice(0, 5).map((entity: any) => (
                      <View
                        key={entity.id}
                        className="flex-row items-center rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800"
                      >
                        <View className="size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#F59E0B" />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="font-medium text-neutral-800 dark:text-white">
                            {entity.name}
                          </Text>
                          <Text className="text-xs text-neutral-500">
                            {translate('room.deviceOnline', { defaultValue: 'Online' })}
                          </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
                      </View>
                    ))}
                  </View>
                )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
