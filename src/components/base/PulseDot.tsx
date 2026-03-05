import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface PulseDotProps {
  color?: string;
  size?: number;
  duration?: number;
  maxScale?: number;
  style?: ViewStyle;
}

export const PulseDot = ({
  color = '#22C55E', // Mặc định xanh lá
  size = 10,
  duration = 1000,
  maxScale = 1.8,
  style,
}: PulseDotProps) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration }),
        withTiming(1, { duration })
      ),
      -1,
      true
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
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
  },
});