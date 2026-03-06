import type { ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  LinearTransition, // <--- VŨ KHÍ TỐI THƯỢNG
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Pressable, Text, WIDTH } from '@/components/ui';
import { ASPECT_RATIO_VIDEO, BASE_SPACE_HORIZONTAL } from '@/constants';
import { cn } from '@/lib/utils';
import { ETheme } from '@/types/base';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const MIN_HEIGHT = 28;
const MAX_WIDTH = 3 * (WIDTH - BASE_SPACE_HORIZONTAL * 2) / 4;
const MAX_HEIGHT = MAX_WIDTH / ASPECT_RATIO_VIDEO;

export const RoomTabItem = memo(({ room, focused, theme, onPress, isExpanded }: any) => {
  const DYNAMIC_MIN_WIDTH = room.title.length * 8 + 42;

  const targetWidth = isExpanded ? MAX_WIDTH : DYNAMIC_MIN_WIDTH;
  const targetRadius = isExpanded ? 24 : 16;
  const progress = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isExpanded ? 1 : 0, { duration: 250 });
  }, [isExpanded, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [MIN_HEIGHT, MAX_HEIGHT]),
  }));

  const gradientOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2], [1, 0], Extrapolation.CLAMP),
  }));

  const imageOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.2, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1.2, 1], Extrapolation.CLAMP) }],
  }));

  const gradientColors = (focused
    ? (theme === ETheme.Light ? ['#141414', '#00000078'] : ['#FFFFFF', '#8D8D8D'])
    : ['#0000000D', '#0000000D']) as ColorValue[];

  return (
    <Animated.View
      layout={LinearTransition.duration(250)}
      style={[{
        width: targetWidth,
        borderRadius: targetRadius,
        overflow: 'hidden',
      }, containerStyle]}
    >
      <Pressable
        onPress={onPress}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatedImage
          source={{ uri: `https://picsum.photos/seed/${room.id}/400/300` }}
          style={[StyleSheet.absoluteFill, imageOpacityStyle]}
          resizeMode="cover"
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            imageOpacityStyle,
            { backgroundColor: 'rgba(0,0,0,0.3)' },
          ]}
        />
        <Animated.View style={[StyleSheet.absoluteFill, gradientOpacityStyle]}>
          <LinearGradient
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            colors={gradientColors as any}
            style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 2 }}
          />
        </Animated.View>
        <Text
          numberOfLines={1}
          style={{ width: '100%' }}
          className={cn(
            'w-full text-center text-sm font-normal',
            focused && 'font-bold',
            focused ? 'text-white dark:text-black' : 'text-black dark:text-white',
          )}
        >
          {room.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
});
