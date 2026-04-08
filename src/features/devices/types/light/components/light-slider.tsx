import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

type Props = {
  value: number; // 0 to 1
  onChange: (val: number) => void;
  onSlidingComplete: (val: number) => void;
  width?: number;
  height?: number;
  colors?: readonly [string, string, ...string[]];
  trackBackgroundColor?: string;
  isVertical?: boolean;
};

export function LightSlider({
  value,
  onChange,
  onSlidingComplete,
  width = 280,
  height = 16,
  thumbSize = 28,
  colors = ['#FFF', '#FEF08A'],
  trackBackgroundColor = 'rgba(0,0,0,0.05)',
  isVertical = false,
}: Props & { thumbSize?: number }) {
  const progress = useSharedValue(value);

  React.useEffect(() => {
    progress.value = withSpring(value);
  }, [value, progress]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      let nextPos = 0;
      if (isVertical) {
        nextPos = 1 - (e.y / height);
      }
      else {
        nextPos = e.x / width;
      }
      nextPos = Math.max(0, Math.min(1, nextPos));
      progress.value = nextPos;
      runOnJS(onChange)(nextPos);
    })
    .onEnd(() => {
      runOnJS(onSlidingComplete)(progress.value);
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    if (isVertical) {
      return {
        bottom: interpolate(progress.value, [0, 1], [0, height - thumbSize], Extrapolation.CLAMP),
      };
    }
    return {
      left: interpolate(progress.value, [0, 1], [0, width - thumbSize], Extrapolation.CLAMP),
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ width, height: isVertical ? height : thumbSize, justifyContent: 'center', alignItems: 'center' }}>
        <View
          className="overflow-hidden rounded-full"
          style={{ width: isVertical ? height : width, height: isVertical ? width : height, backgroundColor: trackBackgroundColor }}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: isVertical ? 1 : 0 }}
            end={{ x: isVertical ? 0 : 1, y: 0 }}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
        <Animated.View
          className="absolute items-center justify-center rounded-full bg-white shadow-md"
          style={[
            {
              width: thumbSize,
              height: thumbSize,
              borderWidth: 2,
              borderColor: '#E5E7EB',
            },
            isVertical ? { left: (width - thumbSize) / 2 } : { top: 0 },
            animatedThumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
