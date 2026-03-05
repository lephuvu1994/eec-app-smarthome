import type { ViewStyle } from 'react-native';
import * as React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type PulseDotProps = {
  color?: string;
  size?: number;
  duration?: number;
  maxScale?: number;
  style?: ViewStyle;
};

export function PulseDot({
  color = '#22C55E', // Mặc định xanh lá
  size = 10,
  duration = 1000,
  maxScale = 1.8,
  style,
}: PulseDotProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration }),
        withTiming(1, { duration }),
      ),
      -1,
      true,
    );
  }, [duration, maxScale]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: interpolate(pulse.value, [1, maxScale], [0.6, 0]),
    };
  });

  return (
    <View style={[styles.container, { width: size * 1.2, height: size * 1.2 }, style]}>
      {/* Vòng tỏa sáng (Pulse) */}
      <Animated.View
        style={[
          styles.pulse,
          pulseStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />

      {/* Chấm tròn chính */}
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
  },
});
