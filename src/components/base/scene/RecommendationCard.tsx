import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

export interface RecommendationCardProps {
  title: string;
  usageCount: string;
  bgGradient: [string, string];
  onAddPress?: () => void;
  className?: string;
  containerStyle?: ViewStyle;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  usageCount,
  bgGradient,
  onAddPress,
  className,
  containerStyle
}) => {
  return (
    <View
      className={cn(
        "rounded-[24px] p-5 h-[150px] flex-col justify-between overflow-hidden relative mb-4",
        className
      )}
      style={!bgGradient ? undefined : containerStyle}
    >
      {/* Nền Gradient */}
      <LinearGradient
        colors={bgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Hiệu ứng Glassmorphism (Các shape chìm) */}
      <View className="absolute -top-12 -right-12 w-48 h-48 rounded-3xl rotate-12 bg-white/20" />
      <View className="absolute -bottom-8 -left-8 w-32 h-32 rounded-3xl -rotate-12 bg-white/10" />
      
      {/* Lớp phủ Glossy nhẹ */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Dòng Trên: Tiêu đề + Nút Thêm */}
      <View className="flex-row justify-between items-start z-10 w-full">
        <Text className="text-[17px] font-bold text-[#1B1B1B] flex-1 mr-4 mt-1" numberOfLines={2}>
          {title}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddPress}
          className="h-8 w-8 rounded-full bg-[#1B1B1B] items-center justify-center shrink-0"
        >
          <Entypo name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Dòng Dưới: Badge số lượt dùng */}
      <View className="z-10 bg-white/40 self-start px-2.5 py-1.5 rounded-[12px] flex-row items-center border border-white/20" style={{ backdropFilter: 'blur(10px)' }}>
        <MaterialCommunityIcons name="fire" size={14} color="#F97316" />
        <Text className="text-[13px] font-medium text-[#1B1B1B]/80 ml-1.5">{usageCount}</Text>
      </View>
    </View>
  );
};
