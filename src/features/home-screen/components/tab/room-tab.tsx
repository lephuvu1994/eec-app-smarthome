import type { ColorValue } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { LightningIcon, SensorTempIcon } from '@/components/ui/icons';
import { ASPECT_RATIO_VIDEO, BASE_SPACE_HORIZONTAL } from '@/constants';
import { cn } from '@/lib/utils';
import { ETheme } from '@/types/base';

const MIN_HEIGHT = 28;
const MAX_WIDTH = 85 * (WIDTH - BASE_SPACE_HORIZONTAL * 2) / 100;
const MAX_HEIGHT = MAX_WIDTH / ASPECT_RATIO_VIDEO;

export const RoomTabItem = memo(({ room, focused, theme, onPress, isExpanded }: any) => {
  const DYNAMIC_MIN_WIDTH = room.title.length * 8 + 42;

  const targetWidth = isExpanded ? MAX_WIDTH : DYNAMIC_MIN_WIDTH;
  const targetRadius = 16;
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

  const titleStyleContainer = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 1.2], Extrapolation.CLAMP);
    return ({
      transform: [{ translateY: interpolate(progress.value, [0, 1], [2, MAX_HEIGHT - 32], Extrapolation.CLAMP) }, {
        translateX: interpolate(progress.value, [0, 1], [42 / 2, 8], Extrapolation.CLAMP),
      }, {
        scale,
      }],
      transformOrigin: 'left center',
    });
  });

  const titleStyleDevice = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 1.2], Extrapolation.CLAMP);
    return ({
      transform: [{ translateY: interpolate(progress.value, [0, 1], [2, MAX_HEIGHT - 8], Extrapolation.CLAMP) }, {
        translateX: interpolate(progress.value, [0, 1], [42 / 2, 8], Extrapolation.CLAMP),
      }, {
        scale,
      }],
      transformOrigin: 'left center',
    });
  });

  const checkIconStyle = useAnimatedStyle(() => {
    // Nội suy vị trí tương tự như Title để nó luôn "đi kèm" với text
    const translateY = interpolate(progress.value, [0, 1], [-4, 8], Extrapolation.CLAMP);

    // Khi nhỏ thì nằm sau text (cần tính toán dựa trên độ dài text)
    // Khi lớn thì có thể cố định ở góc phải hoặc cạnh text
    const translateX = interpolate(progress.value, [0, 1], [DYNAMIC_MIN_WIDTH - 12, MAX_WIDTH - 28], Extrapolation.CLAMP);

    return {
      opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
      transform: [{ translateY }, { translateX }],
      transformOrigin: 'center center',
    };
  });

  const gradientColors = (focused
    ? (theme === ETheme.Light ? ['#141414', '#00000078'] : ['#FFFFFF', '#8D8D8D'])
    : ['#0000000D', '#0000000D']) as ColorValue[];

  return (
    <Animated.View
      layout={LinearTransition.duration(250)}
      style={[{
        width: targetWidth,
        borderRadius: targetRadius,
        marginVertical: 8,
      }, containerStyle]}
    >
      <Pressable
        onPress={onPress}
        className="relative flex-1 items-center justify-center overflow-hidden"
        style={{
          borderRadius: targetRadius,
        }}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, imageOpacityStyle]}
          pointerEvents="none" // Đảm bảo không chặn sự kiện bấm của Pressable
        >
          {/* 1. Ảnh nền */}
          <Image
            source={require('@@/assets/room/default_image.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />

          <LinearGradient
            // start ở giữa ảnh, end ở đáy ảnh
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 0.5, y: 1 }}
            colors={['transparent', 'rgba(0, 0, 0, 0.75)']} // Phía trên trong suốt hoàn toàn -> Ảnh sáng
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%', // Chỉ chiếm 60% chiều cao phía dưới
            }}
          />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, gradientOpacityStyle]}>
          <LinearGradient
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            colors={gradientColors as any}
            style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 2 }}
          />
        </Animated.View>
        <Animated.View className="absolute h-full w-full" style={[titleStyleContainer]}>
          <Text
            numberOfLines={1}
            style={{ width: '100%' }}
            className={cn(
              'text-sm font-normal',
              focused && 'font-bold',
              focused ? 'text-white dark:text-black' : 'text-black dark:text-white',
              isExpanded && 'font-bold text-white dark:text-black',
            )}
          >
            {room.title}
          </Text>
        </Animated.View>
        <Animated.View className="absolute inset-0 h-full w-full" style={[titleStyleDevice, imageOpacityStyle]}>
          <Text
            numberOfLines={1}
            style={{ width: '100%' }}
            className={cn(
              'text-xs font-normal text-[#A3EC3E]',
            )}
          >
            3 thiết bị
          </Text>
        </Animated.View>
      </Pressable>
      {/* DẤU TÍCH XANH */}
      <Animated.View
        className="absolute inset-0"
        style={[checkIconStyle]}
      >
        <View className="h-4.5 w-4.5 items-center justify-center rounded-full bg-[#A3EC3E] p-0.75">
          <Entypo name="check" size={10} color="#0F0F0F" />
        </View>

      </Animated.View>
      <Animated.View
        className="absolute top-2 left-2 h-6 w-34 flex-row"
        style={[imageOpacityStyle]}
      >
        <View className="rounder-full h-8 w-14 overflow-hidden">
          <BlurView
            intensity={25} // Tương đương khoảng 12px blur
            tint="light" // Tạo lớp phủ trắng sáng
            style={{
              borderRadius: 16, // --border-radius-round
              overflow: 'hidden', // Quan trọng để bo góc được lớp blur
              backgroundColor: 'rgba(255, 255, 255, 0.4)', // Kết hợp với tint để ra đúng 0.6 opacity
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)', // Viền mảnh cho sang
            }}
          >
            <View className="flex-row items-center gap-0.5 bg-white/60">
              <SensorTempIcon size={16} />
              <Text className="text-xs text-neutral-500">20°C</Text>
            </View>
          </BlurView>
        </View>

        <View className="rounder-full h-8 w-18 overflow-hidden">
          <BlurView
            intensity={25} // Tương đương khoảng 12px blur
            tint="light" // Tạo lớp phủ trắng sáng
            style={{
              borderRadius: 16, // --border-radius-round
              overflow: 'hidden', // Quan trọng để bo góc được lớp blur
              backgroundColor: 'rgba(255, 255, 255, 0.4)', // Kết hợp với tint để ra đúng 0.6 opacity
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)', // Viền mảnh cho sang
            }}
          >
            <View className="flex-row items-center gap-0.5 bg-white/60">
              <LightningIcon size={16} />
              <Text className="text-xs text-neutral-500">244 kwc</Text>
            </View>
          </BlurView>
        </View>
      </Animated.View>
    </Animated.View>
  );
});
