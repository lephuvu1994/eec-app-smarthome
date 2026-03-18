/* eslint-disable react-hooks/immutability */
import type { FlashListRef } from '@shopify/flash-list';
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useRef, useState } from 'react';
import {
  StyleSheet,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, FocusAwareStatusBar, HEIGHT, List, Text, TouchableOpacity, View, WIDTH } from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';
import { translate } from '@/lib/i18n';

/**
 * DESIGN COLORS
 */
const COLORS = {
  background: '#FFFFFF',
  textSecondary: '#6B7280',
  textPrimary: '#1B1B1B',
  neon: '#A3E635', // Lime green
};

const DATA = [
  {
    id: '1',
    title: translate('onboarding.slide1Title'),
    description: translate('onboarding.slide1Desc'),
    image: require('@@/assets/onboarding/onboarding-step1.png'),
  },
  {
    id: '2',
    title: translate('onboarding.slide2Title'),
    description: translate('onboarding.slide2Desc'),
    image: require('@@/assets/onboarding/onboarding-step2.png'),
  },
  {
    id: '3',
    title: translate('onboarding.slide3Title'),
    description: translate('onboarding.slide3Desc'),
    image: require('@@/assets/onboarding/onboarding-step3.png'),
  },
];

export function OnboardingScreen() {
  const [_, setFirstTime] = useIsFirstTime();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scale = useSharedValue(1);
  const listRef = useRef<FlashListRef<typeof DATA[number]>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0)
      setIndex(viewableItems[0].index);
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const next = () => {
    if (index < DATA.length - 1) {
      listRef.current?.scrollToIndex({
        index: index + 1,
      });
    }
    else {
      setFirstTime(false);
      router.push('/(app)');
    }
  };

  // Tạo style chạy theo biến scale
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const renderItem = ({ item }: any) => {
    return (
      <View style={{ width: WIDTH }}>
        {/* LOGO & TEXT AREA */}
        <View
          className="w-full items-start px-6"
          style={{
            height: HEIGHT * 0.35 - 132 - insets.top,
          }}
        >
          <Text className="mb-4 w-full text-[32px]/10 font-bold text-[#1B1B1B] dark:text-[#1B1B1B]" style={{ color: COLORS.textPrimary }}>
            {item.title.split('Sensa Space').map((part: string, index: number, array: string[]) => (
              <Text
                className="text-3xl font-bold"
                key={index}
                numberOfLines={1} // Bắt buộc phải có để báo cho RN biết giới hạn dòng
                adjustsFontSizeToFit // Tự động bóp nhỏ font nếu text quá dài
                minimumFontScale={0.5}
              >
                {part}
                {index < array.length - 1 && (
                  <Text className="text-3xl font-bold" style={{ color: '#93D737' }}>Sensa Space</Text>
                )}
              </Text>
            ),
            )}
          </Text>
          <Text className="text-xl/7 text-neutral-500 dark:text-neutral-500" style={{ color: COLORS.textSecondary }}>
            {item.description}
          </Text>
        </View>

        {/* IMAGE AREA */}
        <View className="relative w-full flex-1 items-center justify-center px-4">
          <Image
            source={item.image}
            style={{ width: WIDTH, height: HEIGHT * 0.65 }}
            contentFit="cover"
          />
          <LinearGradient
            colors={['#FFFFFF', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.2525 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
          {/* Lớp 2: Gradient mờ ở DƯỚI CÙNG (Từ trong suốt mờ dần thành trắng) */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', '#FFFFFF']}
            start={{ x: 0, y: 0.9 }} // Bắt đầu từ 75% chiều cao ảnh (gần cuối)
            end={{ x: 0, y: 1 }} // Kết thúc ở mép dưới cùng (100%)
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <FocusAwareStatusBar />
      <View className="px-4" style={{ paddingTop: insets.top + 32 }}>
        <Image
          source={require('@@/assets/base/icon-wrapper-full.png')}
          style={{
            width: 140,
            height: 40,
          }}
          contentFit="cover"
        />
      </View>
      {/* LIST */}
      <View className="flex-1 pt-8">
        <List
          ref={listRef}
          data={DATA}
          renderItem={renderItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          pagingEnabled={true}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id}
        />
      </View>

      {/* FOOTER: Indicators & Next Button */}
      <View
        className="absolute right-0 left-0 z-10 w-full flex-row items-center justify-between px-6"
        style={{ bottom: insets.bottom + 32 }}
      >
        {/* Indicators */}
        <View className="flex-row gap-2">
          {DATA.map((_, i) => (
            <View
              key={i}
              className="h-1.5 rounded-full"
              style={{
                backgroundColor: i === index ? '#D1D5DB' : '#F3F4F6',
                width: i === index ? 32 : 16, // Active is longer
              }}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="h-11.5 w-19 items-center justify-center rounded-full bg-white/53 p-1.5 shadow-sm"
          onPress={next}
          onPressIn={() => {
            // Khi ấn xuống: Thu nhỏ về 90% (0.9) với tốc độ nhanh
            scale.value = withTiming(0.9, { duration: 100 });
          }}
          onPressOut={() => {
            // Khi thả tay: Nảy lại kích thước gốc bằng lò xo (spring)
            scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          }}
        >
          <Animated.View
            className="h-full w-full items-center justify-center rounded-full"
            style={[{
              backgroundColor: colors.neon,
            }, animatedButtonStyle]}
          >
            <AntDesign name="arrow-right" size={16} color={COLORS.textPrimary} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
