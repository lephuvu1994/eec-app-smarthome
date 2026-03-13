import type { DimensionValue } from 'react-native';
import { memo, useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useUniwind } from 'uniwind';
import { ETheme } from '@/types/base';

type TSkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  className?: string;
};

/**
 * Base Skeleton component with shimmer animation.
 * Adapts colors to light/dark theme automatically.
 */
export const Skeleton = memo(({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className,
}: TSkeletonProps) => {
  const { theme } = useUniwind();
  const shimmer = useSharedValue(0);

  const bgColor = theme === ETheme.Dark ? '#2A2A2A' : '#E5E5E5';

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(shimmer);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 1]),
    backgroundColor: theme === ETheme.Dark
      ? `rgba(58, 58, 58, ${interpolate(shimmer.value, [0, 1], [0.6, 1])})`
      : `rgba(229, 229, 229, ${interpolate(shimmer.value, [0, 1], [0.6, 1])})`,
  }));

  return (
    <Animated.View
      className={className}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: bgColor,
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    />
  );
});
