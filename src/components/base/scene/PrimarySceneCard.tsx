import type { ImageSourcePropType, ImageStyle, ViewStyle } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image'; // Thêm Image từ expo-image
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/utils';

export type SceneCardProps = {
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
  bgPatternStyle?: ImageStyle; // Style cho ảnh (chỉnh vị trí)
  showGlossyEffect?: boolean; // Bật/tắt quầng sáng hắt từ góc

  onPress?: () => void;
  onMenuPress?: () => void;
  className?: string;
  containerStyle?: ViewStyle;
};

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
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={cn(
        'relative aspect-3/2 flex-col justify-between overflow-hidden rounded-[20px] p-4 shadow-sm',
        className,
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
      <View className="z-10 flex-row items-start justify-between">
        {/* Box chứa icon - Thêm đk: Nếu ko có icon thì ko render cái box nền mờ */}
        {icon
          ? (
              <View
                className="size-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: iconBgColor }}
              >
                {icon}
              </View>
            )
          : <View />}

        <TouchableOpacity
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          onPress={onMenuPress}
          className="size-6 items-center justify-center rounded-full bg-white/10"
        >
          <Entypo name="dots-three-horizontal" size={14} color={menuIconColor} />
        </TouchableOpacity>
      </View>

      {/* --- PHẦN TITLE --- */}
      <Text
        className="z-10 text-[15px] font-semibold"
        style={{ color: textColor }}
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
