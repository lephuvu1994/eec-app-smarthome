/* eslint-disable react-refresh/only-export-components */
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { Platform, Pressable, StatusBar, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';

// ─── Constants ─────────────────────────────────────────────────────────────
/** Height of header content area (below status bar) */
export const HEADER_CONTENT_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

/** Total header height = status bar + content */
export function useHeaderOffset() {
  const insets = useSafeAreaInsets();
  return (insets.top > 0 ? insets.top : (StatusBar.currentHeight || 0)) + HEADER_CONTENT_HEIGHT;
}

// ─── SpringButton ──────────────────────────────────────────────────────────
/**
 * A button that feels native:
 * - iOS: spring scale bounce on press
 * - Android: ripple + spring scale bounce
 * - Both: haptic feedback
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SpringButtonProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /**
   * Haptic feedback style. Default: Light
   */
  haptics?: Haptics.ImpactFeedbackStyle | null;
};

export function SpringButton({
  children,
  style,
  onPress,
  haptics = Haptics.ImpactFeedbackStyle.Light,
  disabled,
  ...rest
}: SpringButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress: PressableProps['onPress'] = React.useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (haptics !== null) {
        Haptics.impactAsync(haptics).catch(() => null);
      }
      onPress?.(e);
    },
    [haptics, onPress],
  );

  return (
    <AnimatedPressable
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(0.82, { damping: 12, stiffness: 300 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, { damping: 10, stiffness: 260 });
      }}
      onPress={handlePress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(128,128,128,0.25)', radius: 20, borderless: true }}
      style={[{ alignItems: 'center', justifyContent: 'center' }, style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── CustomHeader ──────────────────────────────────────────────────────────
type CustomHeaderProps = {
  /** Centre title text */
  title?: string;
  /** Custom title component (overrides title string) */
  titleComponent?: React.ReactNode;
  /** Left side — defaults to nothing. Pass e.g. <HeaderBackButton /> */
  leftContent?: React.ReactNode;
  /** Right side */
  rightContent?: React.ReactNode;
  /** Override container style */
  style?: StyleProp<ViewStyle>;
  /** Override tint color for default text */
  tintColor?: string;
  /** Disable top safe area insets (useful for iOS pageSheet modals) */
  disableSafeArea?: boolean;
};

/**
 * Transparent absolute header that sits right below the status bar.
 * Content is padded to clear the status bar via safe-area insets.
 *
 * Offset for screen content: use `useHeaderOffset()` as paddingTop.
 */
export function CustomHeader({
  title,
  titleComponent,
  leftContent,
  rightContent,
  style,
  tintColor = '#1B1B1B',
  disableSafeArea = false,
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  const paddingTopOffset = disableSafeArea && Platform.OS === 'ios' ? 16 : insets.top;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: paddingTopOffset,
        },
        style,
      ]}
    >
      <View
        style={{
          height: HEADER_CONTENT_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}
      >
        {/* Left slot */}
        <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
          {leftContent}
        </View>

        {/* Centre title */}
        <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
          {titleComponent ?? (
            title
              ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: Platform.OS === 'ios' ? 17 : 18,
                      fontWeight: Platform.OS === 'ios' ? '600' : '500',
                      color: tintColor,
                    }}
                  >
                    {title}
                  </Text>
                )
              : null
          )}
        </View>

        {/* Right slot */}
        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
          {rightContent}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Convenience back button ────────────────────────────────────────────────
export function HeaderBackButton({
  onPress,
  color = '#1B1B1B',
  icon,
}: {
  onPress: () => void;
  color?: string;
  /** Override icon — default is a Chevron via MaterialCommunityIcons name */
  icon?: React.ReactNode;
}) {
  // Dynamic import to avoid adding heavy dep here; callers bring their own icon if needed
  const [BackIcon, setBackIcon] = React.useState<React.ReactElement | null>(null);

  React.useEffect(() => {
    if (!icon) {
      // Dynamically grab the icon lib to keep this file dep-free
      import('@expo/vector-icons').then(({ Feather }) => {
        setBackIcon(
          <Feather name="arrow-left" size={24} color={color} />,
        );
      }).catch(() => null);
    }
  }, [color, icon]);

  return (
    <SpringButton
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(120, 120, 128, 0.12)',
      }}
      accessibilityLabel="Go back"
    >
      {icon ?? BackIcon}
    </SpringButton>
  );
}

// ─── Convenience icon button ────────────────────────────────────────────────
export function HeaderIconButton({
  onPress,
  children,
  disabled,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <SpringButton
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(120, 120, 128, 0.12)',
      }}
    >
      {children}
    </SpringButton>
  );
}
