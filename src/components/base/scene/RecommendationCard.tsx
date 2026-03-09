import type { ViewStyle } from 'react-native';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { cn } from '@/lib/utils';

export type RecommendationCardProps = {
  title: string;
  usageCount: string;

  // Nền: Làm cho cả 2 thành optional để dùng 1 trong 2
  bgGradient?: [string, string];
  bgImage?: any; // Dùng any hoặc ImageSourcePropType để nhận require() hoặc { uri: '...' }

  onAddPress?: () => void;
  className?: string;
  containerStyle?: ViewStyle;
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  usageCount,
  bgGradient,
  bgImage,
  onAddPress,
  className,
  containerStyle,
}) => {
  return (
    <View
      className={cn(
        'relative mb-4 h-[150px] flex-col justify-between overflow-hidden rounded-[24px] p-5',
        className,
      )}
      style={!bgGradient ? undefined : containerStyle}
    >
      {/* NỀN: Ưu tiên dùng bgImage, nếu không có mới dùng bgGradient */}
      {bgImage
        ? (
            <Image
              source={bgImage}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
          )
        : bgGradient
          ? (
              <LinearGradient
                colors={bgGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )
          : null}

      {/* Hiệu ứng Glassmorphism (Các shape chìm) */}
      <View className="absolute -top-12 -right-12 size-48 rotate-12 rounded-3xl bg-white/20" />
      <View className="absolute -bottom-8 -left-8 size-32 -rotate-12 rounded-3xl bg-white/10" />

      {/* Lớp phủ Glossy nhẹ */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Dòng Trên: Tiêu đề + Nút Thêm */}
      <View className="z-10 w-full flex-row items-start justify-between">
        <Text className="mt-1 mr-4 flex-1 text-[17px] font-semibold text-[#1B1B1B]" numberOfLines={2}>
          {title}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddPress}
          className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1B1B1B]"
        >
          <Entypo name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Dòng Dưới: Badge số lượt dùng */}
      <View className="z-10 flex-row items-center self-start rounded-[12px] border border-white/20 bg-white/40 px-2.5 py-1.5" style={{ backdropFilter: 'blur(10px)' }}>
        <MaterialCommunityIcons name="fire" size={14} color="#F97316" />
        <Text className="ml-1.5 text-[13px] font-medium text-[#1B1B1B]/80">{usageCount}</Text>
      </View>
    </View>
  );
};
