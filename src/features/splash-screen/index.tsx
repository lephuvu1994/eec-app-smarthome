import Env from '@env';
import { DeviceType, deviceType } from 'expo-device';
import { Image } from 'expo-image';
import * as React from 'react';
import { useEffect } from 'react';

import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocusAwareStatusBar, Text, View, WIDTH } from '@/components/ui';

export default function SplashScreen() {
  const animatedValue = useSharedValue(82);
  const animatedText = useSharedValue(0);
  const insets = useSafeAreaInsets();

  // New Animations
  const scaleValue = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    // Fade-in
    logoOpacity.value = withTiming(1, { duration: 300 });

    // Pulse Scale
    scaleValue.value = withTiming(1.03, { duration: 300 }, () => {
      scaleValue.value = withTiming(1, { duration: 300 });
    });

    // Shimmer light running across logo
    shimmer.value = withTiming(1, { duration: 900 });

    // Your existing animations
    animatedValue.value = 82;

    const timer = setTimeout(() => {
      animatedValue.value = withTiming((3 * WIDTH) / 4, { duration: 700 });
      animatedText.value = withTiming(100, { duration: 400 });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Logo width animation
  const styleLogo = useAnimatedStyle(() => ({
    width: animatedValue.value,
  }));

  // Fade + scale animation
  const styleScaleFade = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: scaleValue.value }],
  }));

  // Shimmer overlay
  const styleShimmer = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * (WIDTH * 0.75) }],
    opacity: 0.35,
  }));

  // Text fade-in + slide-in
  const styleTextOpacity = useAnimatedStyle(() => ({
    opacity: animatedText.value / 100,
    left: 130 - (animatedText.value / 100) * 130,
  }));

  // Center icon by sliding it based on animation
  const styleImage = useAnimatedStyle(() => ({
    left: ((3 * WIDTH) / 4 - 82 - (animatedValue.value - 82)) / 2,
  }));

  const iconWidth = deviceType === DeviceType.PHONE ? (WIDTH * 3) / 4 : WIDTH / 3;

  const iconHeight = iconWidth * (267 / 923);

  return (
    <View className="relative w-full flex-1 items-center justify-center">
      <FocusAwareStatusBar hidden />
      <View
        className="absolute w-full flex-1 items-center justify-center"
        style={{
          top: insets.top,
          bottom: insets.bottom,
          left: insets.left,
          right: insets.right,
        }}
      >
        {/* --- LOGO ANIMATION WRAPPER --- */}
        <Animated.View
          className="-mt-32 items-center justify-center overflow-hidden"
          style={[styleLogo, styleScaleFade]}
        >
          {/* Main Logo */}
          <Animated.Image
            source={require('@@/assets/splash-icon.png')}
            className="w-full"
            resizeMode="cover"
            style={[styleImage, { width: iconWidth, height: iconHeight }]}
          />

          {/* Shimmer Light Effect */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styleShimmer,
              {
                width: '35%',
                backgroundColor: 'white',
                borderRadius: 20,
              },
            ]}
          />
        </Animated.View>

        {/* --- SUBTEXT --- */}
        <View className="-mt-3" style={{ width: iconWidth, alignItems: 'flex-end' }}>
          <View className="justify-end">
            <View style={{ width: 130, overflow: 'hidden' }}>
              <Animated.Text style={[styleTextOpacity]} className="text-xs font-semibold text-yellow-500/70 italic">
                Design by Euro Sol
              </Animated.Text>
            </View>
          </View>
        </View>

        {/* --- VERSION --- */}
        <View className="absolute bottom-0">
          <View className="justify-end overflow-hidden">
            <Text className="text-sm font-semibold text-[#A5A5A5] dark:text-white">
              v
              {Env.EXPO_PUBLIC_VERSION}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
