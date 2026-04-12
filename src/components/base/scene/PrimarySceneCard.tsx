import type { ImageSourcePropType, ImageStyle, ViewStyle } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image'; // Thêm Image từ expo-image
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import { useUniwind } from 'uniwind';
import { Text } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type TSceneCardProps = {
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
  onDelayPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  onDisabledPress?: () => void;
  className?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  useAspectRatio?: boolean;
};

export const PrimarySceneCard: React.FC<TSceneCardProps> = ({
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
  onDelayPress,
  onEditPress,
  onDeletePress,
  onDisabledPress,
  className,
  containerStyle,
  disabled = false,
  useAspectRatio = true,
}) => {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const [menuMounted, setMenuMounted] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const menuRef = React.useRef<any>(null);
  const pendingActionRef = React.useRef<(() => void) | null>(null);

  const openMenu = () => {
    setMenuMounted(true);
    requestAnimationFrame(() => {
      setMenuVisible(true);
    });
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    }
    else if (onDelayPress || onEditPress || onDeletePress) {
      if (menuRef.current) {
        openMenu();
      }
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      onPress={disabled ? onDisabledPress : onPress}
      className={cn(
        'relative flex-col justify-between overflow-hidden rounded-[20px] p-4 shadow-sm',
        useAspectRatio && 'aspect-3/2',
        disabled && 'opacity-50',
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
          contentFit="contain"
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
          ref={menuRef}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          onPress={handleMenuPress}
          className="size-6 items-center justify-center rounded-full bg-white/10"
        >
          <Entypo name="dots-three-horizontal" size={14} color={menuIconColor} />
        </TouchableOpacity>

        {menuMounted && (
          <Popover
            isVisible={menuVisible}
            onRequestClose={closeMenu}
            onCloseComplete={() => {
              setMenuMounted(false);
              if (pendingActionRef.current) {
                const action = pendingActionRef.current;
                pendingActionRef.current = null;
                // Delay to let Popover's internal async generator fully settle
                // before navigating away (which unmounts the screen + menuRef)
                setTimeout(action, 100);
              }
            }}
            placement={PopoverPlacement.BOTTOM}
            from={menuRef}
            popoverStyle={{
              borderRadius: 12,
              backgroundColor: isDark ? '#27272A' : '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              width: 140,
              overflow: 'hidden',
            }}
          >
            <View className="flex-col">
              {onDelayPress && (
                <TouchableOpacity
                  className="border-b border-gray-100 px-4 py-3 dark:border-neutral-800"
                  onPress={() => {
                    pendingActionRef.current = onDelayPress || null;
                    closeMenu();
                  }}
                >
                  <Text className="text-[15px] font-medium text-gray-800 dark:text-gray-100">
                    {translate('scenes.builder.delay' as any) || 'Hẹn giờ'}
                  </Text>
                </TouchableOpacity>
              )}
              {onEditPress && (
                <TouchableOpacity
                  className="border-b border-gray-100 px-4 py-3 dark:border-neutral-800"
                  onPress={() => {
                    pendingActionRef.current = onEditPress || null;
                    closeMenu();
                  }}
                >
                  <Text className="text-[15px] font-medium text-gray-800 dark:text-gray-100">
                    {translate('base.edit')}
                  </Text>
                </TouchableOpacity>
              )}
              {onDeletePress && (
                <TouchableOpacity
                  className="px-4 py-3"
                  onPress={() => {
                    pendingActionRef.current = onDeletePress || null;
                    closeMenu();
                  }}
                >
                  <Text className="text-[15px] font-medium text-red-500">
                    {translate('base.delete' as any) || 'Xoá'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Popover>
        )}
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
