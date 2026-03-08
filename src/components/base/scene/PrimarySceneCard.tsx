import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, ImageStyle, ImageSourcePropType } from 'react-native';
import { Text } from '@/components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image'; // Thêm Image từ expo-image
import { Entypo } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

export interface SceneCardProps {
  title: string;
  icon?: React.ReactNode;

  // 1. Nền
  cardColor?: string;
  bgGradient?: [string, string];

  // 2. Tùy chỉnh màu sắc
  iconBgColor?: string;
  textColor?: string;
  menuIconColor?: string;

  // 3. Các hiệu ứng nâng cao (Vừa thêm lại)
  bgPattern?: ImageSourcePropType; // Ảnh lượn sóng hoặc 3D Icon
  bgPatternStyle?: ImageStyle;     // Style cho ảnh (chỉnh vị trí)
  showGlossyEffect?: boolean;      // Bật/tắt quầng sáng hắt từ góc

  onPress?: () => void;
  onMenuPress?: () => void;
  className?: string;
  containerStyle?: ViewStyle;
}

export const PrimarySceneCard: React.FC<SceneCardProps> = ({
  title,
  icon,
  cardColor = '#FFFFFF',
  bgGradient,
  iconBgColor = 'rgba(255, 255, 255, 0.3)',
  textColor = '#1B1B1B',
  menuIconColor = '#1B1B1B',
  bgPattern,
  bgPatternStyle,
  showGlossyEffect = false,
  onPress,
  onMenuPress,
  className,
  containerStyle
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={cn(
        "aspect-3/2 rounded-[20px] p-4 flex-col justify-between overflow-hidden relative shadow-sm",
        className
      )}
      style={[!bgGradient ? { backgroundColor: cardColor } : undefined, containerStyle]}
    >
      {/* LỚP 1: NỀN GRADIENT */}
      {bgGradient && (
        <LinearGradient
          colors={bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* LỚP 2: ẢNH PATTERN HOẶC 3D ICON */}
      {bgPattern && (
        <Image
          source={bgPattern}
          style={[StyleSheet.absoluteFillObject, bgPatternStyle]}
          contentFit="contain" // Đổi thành contain nếu bác dùng ảnh 3D
        />
      )}

      {/* LỚP 3: QUẦNG SÁNG GLOSSY (Hình số 3) */}
      {showGlossyEffect && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 0.8 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}

      {/* --- PHẦN ICON & MENU --- */}
      <View className="flex-row justify-between items-start z-10">
        {/* Box chứa icon - Thêm đk: Nếu ko có icon thì ko render cái box nền mờ */}
        {icon ? (
          <View
            className="w-10 h-10 rounded-2xl items-center justify-center"
            style={{ backgroundColor: iconBgColor }}
          >
            {icon}
          </View>
        ) : <View />}

        <TouchableOpacity
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          onPress={onMenuPress}
          className="h-6 w-6 items-center justify-center rounded-full bg-white/10"
        >
          <Entypo name="dots-three-horizontal" size={14} color={menuIconColor} />
        </TouchableOpacity>
      </View>

      {/* --- PHẦN TITLE --- */}
      <Text
        className="text-[15px] font-semibold z-10"
        style={{ color: textColor }}
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};