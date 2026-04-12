import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveCameraWrapper } from '@/components/base/LiveCameraWrapper';
import { Pressable, Text, View, WIDTH } from '@/components/ui';

// Re-using the same function logic to match the stable pseudo-random placeholder
function getRoomPlaceholder(roomId: string) {
  const sum = roomId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const images = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600607687920-4e2a09be1587?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=400',
  ];
  return images[sum % images.length];
}

export function RoomDashboardScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const roomId = params.id as string;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const imageUrl = getRoomPlaceholder(roomId);

  // NOTE: In the future, fetch actual videoUrl from room.camera entities.
  const videoUrl = undefined;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* HEADER HERO AREA */}
      <View style={{ width: WIDTH, height: WIDTH * 0.75 }} className="relative z-0">
        {/* Hero image with shared element transition */}
        <Animated.Image
          sharedTransitionTag={`room-img-${roomId}`}
          source={{ uri: imageUrl }}
          style={{ width: WIDTH, height: WIDTH * 0.75, position: 'absolute', top: 0, left: 0 }}
          resizeMode="cover"
        />

        {/* Live Camera Overlay - fades in AFTER the shared element transition */}
        {videoUrl && (
          <Animated.View
            entering={FadeIn.duration(400).delay(300)}
            style={StyleSheet.absoluteFillObject}
          >
            <LiveCameraWrapper
              videoUrl={videoUrl}
              imageUrl={imageUrl}
              handleError={() => console.log('Camera error')}
            />
          </Animated.View>
        )}

        {/* Dark overlay for top-bar readiness */}
        <Animated.View
          entering={FadeInUp.duration(300).delay(200)}
          className="absolute inset-x-0 top-0 h-40 bg-black/40"
        />
        <Animated.View
          entering={FadeInUp.duration(300).delay(200)}
          style={{ paddingTop: Math.max(insets.top, 24) }}
          className="absolute inset-x-0 top-0 z-10 flex-row items-center justify-between px-4"
        >
          <Pressable
            onPress={() => router.back()}
            className="size-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md"
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="text-xl font-bold text-white shadow-sm">
            Room
          </Text>
          <View className="size-10" />
        </Animated.View>
      </View>

      {/* CONTENT AREA */}
      <ScrollView className="-mt-6 flex-1 rounded-t-3xl border-t border-white/10 bg-neutral-100 p-6 shadow-2xl dark:border-white/5 dark:bg-neutral-900">
        <Text className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          Devices
        </Text>
        <Text className="mt-2 text-base text-neutral-500">
          Room control dashboard placeholder
        </Text>
      </ScrollView>
    </View>
  );
}
