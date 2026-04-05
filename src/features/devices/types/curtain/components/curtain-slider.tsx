import type { LayoutChangeEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import * as React from 'react';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

type Props = {
  position: SharedValue<number>;
  onSlidingComplete: (value: number) => void;
  disabled?: boolean;
};

export function CurtainSlider({ position, onSlidingComplete, disabled }: Props) {
  const [width, setWidth] = useState(0);
  const isInteracting = useSharedValue(false);
  const sliderPosition = useSharedValue(0);

  // Sync external position -> sliderPosition, ONLY if not interacting
  useAnimatedReaction(
    () => position.value,
    (val) => {
      if (!isInteracting.value) {
        sliderPosition.value = val;
      }
    },
    [position, isInteracting, sliderPosition],
  );

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && width > 0)
    .onEnd((e) => {
      let newPct = (e.x / width) * 100;
      if (newPct < 0)
        newPct = 0;
      if (newPct > 100)
        newPct = 100;
      sliderPosition.value = newPct;
      runOnJS(onSlidingComplete)(Math.round(newPct));
    });

  const panGesture = Gesture.Pan()
    .enabled(!disabled && width > 0)
    .onStart(() => {
      isInteracting.value = true;
    })
    .onUpdate((e) => {
      let newPct = (e.x / width) * 100;
      if (newPct < 0)
        newPct = 0;
      if (newPct > 100)
        newPct = 100;
      sliderPosition.value = newPct;
    })
    .onEnd(() => {
      isInteracting.value = false;
      runOnJS(onSlidingComplete)(Math.round(sliderPosition.value));
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${sliderPosition.value}%`,
    };
  }, [sliderPosition]);

  const thumbStyle = useAnimatedStyle(() => {
    return {
      left: `${sliderPosition.value}%`,
      transform: [{ translateX: -12 }],
    };
  }, [sliderPosition]);

  return (
    <GestureDetector gesture={composedGesture}>
      <View
        className="h-10 w-full justify-center"
        onLayout={onLayout}
        hitSlop={{ top: 10, bottom: 10 }}
      >
        <View className="absolute inset-x-0 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <Animated.View
          className="absolute h-2 rounded-full bg-[#A3E635]"
          style={progressStyle}
        />
        <Animated.View
          className="absolute size-6 items-center justify-center rounded-full border border-neutral-100 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-800"
          style={thumbStyle}
        >
          <View className="size-2 rounded-full bg-[#A3E635]" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
