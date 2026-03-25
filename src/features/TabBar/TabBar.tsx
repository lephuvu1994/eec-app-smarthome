import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { SFSymbol } from 'expo-symbols';
import type { LayoutChangeEvent } from 'react-native';

import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useSegments } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { colors, Pressable, Text, View, WIDTH } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const HAS_LIQUID_GLASS = isLiquidGlassAvailable();
const SLIDE_DURATION = 280;
const TAB_BAR_HEIGHT = 76;
const ICON_SIZE = 32;
const DROPLET_BORDER_RADIUS = 48;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type TTabConfig = {
  sfSymbol: SFSymbol;
  sfSymbolFocused: SFSymbol;
  title: string;
};

// ──────────────────────────────────────────────
// Tab Config
// ──────────────────────────────────────────────

const TAB_CONFIG: Record<string, TTabConfig> = {
  '(room)': {
    sfSymbol: 'door.left.hand.open',
    sfSymbolFocused: 'door.left.hand.open',
    title: translate('app.roomTab', { defaultValue: 'Rooms' }),
  },
  '(home)': {
    sfSymbol: 'house',
    sfSymbolFocused: 'house.fill',
    title: translate('app.favoriteTab', { defaultValue: 'Favorite' }),
  },
  '(smart)': {
    sfSymbol: 'square.split.bottomrightquarter',
    sfSymbolFocused: 'square.split.bottomrightquarter.fill',
    title: translate('app.smartTab', { defaultValue: 'Smart' }),
  },
  '(settings)': {
    sfSymbol: 'gearshape',
    sfSymbolFocused: 'gearshape.fill',
    title: translate('app.settingTab', { defaultValue: 'Settings' }),
  },
};

const PREFERRED_TAB_ORDER = ['(room)', '(home)', '(smart)', '(settings)'];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getOrderedRoutes(routes: BottomTabBarProps['state']['routes']) {
  return [...routes].sort((a, b) => {
    const ai = PREFERRED_TAB_ORDER.indexOf(a.name);
    const bi = PREFERRED_TAB_ORDER.indexOf(b.name);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

// ──────────────────────────────────────────────
// Animated Indicator (glass droplet)
// ──────────────────────────────────────────────

function ActiveIndicator({
  tabCount,
  activeIndex,
  isDark,
  containerWidth,
}: {
  tabCount: number;
  activeIndex: number;
  isDark: boolean;
  containerWidth: number;
}) {
  const tabWidth = containerWidth / Math.max(tabCount, 1);
  const targetX = containerWidth > 0 ? activeIndex * tabWidth : 0;

  const translateX = useSharedValue(targetX);
  translateX.value = withTiming(targetX, { duration: 250 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
    opacity: containerWidth > 0 ? 1 : 0,
  }));

  const dropletStyle = {
    position: 'absolute' as const,
    top: 2,
    bottom: 2,
    borderRadius: DROPLET_BORDER_RADIUS,
    overflow: 'hidden' as const,
    zIndex: 0,
  };

  if (HAS_LIQUID_GLASS) {
    return (
      <Animated.View style={[dropletStyle, animatedStyle]}>
        <GlassView
          style={StyleSheet.absoluteFill}
          glassEffectStyle="clear"
          colorScheme={isDark ? 'dark' : 'light'}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        dropletStyle,
        animatedStyle,
        {
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.05)',
        },
      ]}
    />
  );
}

// ──────────────────────────────────────────────
// Main CustomTabBar
// ──────────────────────────────────────────────

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const segments = useSegments() as string[];
  const [tabRowWidth, setTabRowWidth] = useState(0);

  const isDark = theme === ETheme.Dark;

  // Slide tab bar out when in room detail
  const roomIdx = segments.indexOf('(room)');
  const isInRoomDetail = roomIdx !== -1 && segments.length > roomIdx + 1;

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: withTiming(isInRoomDetail ? TAB_BAR_HEIGHT + insets.bottom : 0, {
        duration: SLIDE_DURATION,
        easing: Easing.out(Easing.cubic),
      }),
    }],
  }), [isInRoomDetail, insets.bottom]);

  const onTabRowLayout = useCallback((e: LayoutChangeEvent) => {
    setTabRowWidth(e.nativeEvent.layout.width);
  }, []);

  const orderedRoutes = getOrderedRoutes(state.routes);

  const activeOrderedIndex = orderedRoutes.findIndex((route) => {
    const realIndex = state.routes.findIndex(r => r.key === route.key);
    return state.index === realIndex;
  });

  const glassWidth = WIDTH - 16 * 2;

  const renderBackground = (children: React.ReactNode) => {
    if (HAS_LIQUID_GLASS) {
      return (
        <GlassView
          className="self-center overflow-hidden rounded-[48px] p-1"
          style={{ width: glassWidth }}
          glassEffectStyle="regular"
          colorScheme={isDark ? 'dark' : 'light'}
        >
          {children}
        </GlassView>
      );
    }

    if (Platform.OS === 'ios') {
      return (
        <BlurView
          className="overflow-hidden border-t border-gray-500/15 pt-1.5"
          intensity={80}
          tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterial'}
        >
          {children}
        </BlurView>
      );
    }

    return (
      <BlurView
        className="overflow-hidden border-t border-gray-500/15 pt-1.5"
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
        experimentalBlurMethod="dimezisBlurView"
      >
        <View
          className="absolute inset-0"
          style={{ backgroundColor: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.88)' }}
        />
        {children}
      </BlurView>
    );
  };

  return (
    <Animated.View
      className="absolute inset-x-0 bottom-0"
      style={[{ paddingBottom: Math.max(insets.bottom - 8, 4) }, slideStyle]}
    >
      {renderBackground(
        <View className="relative flex-row items-center" onLayout={onTabRowLayout}>
          <ActiveIndicator
            tabCount={orderedRoutes.length}
            activeIndex={activeOrderedIndex}
            isDark={isDark}
            containerWidth={tabRowWidth}
          />

          {orderedRoutes.map((route) => {
            const realIndex = state.routes.findIndex(r => r.key === route.key);
            const { options } = descriptors[route.key];
            const isFocused = state.index === realIndex;
            const config = TAB_CONFIG[route.name];

            const color = isFocused
              ? colors.neon
              : (isDark ? 'rgba(255,255,255,0.85)' : '#1C1C1E');

            const sfName = config
              ? (isFocused ? config.sfSymbolFocused : config.sfSymbol)
              : undefined;

            const title = typeof options.title === 'string'
              ? options.title
              : config?.title ?? route.name;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                onLongPress={() => {
                  navigation.emit({ type: 'tabLongPress', target: route.key });
                }}
                className="z-1 flex-1 items-center justify-center gap-0.5 py-1.5"
              >
                <SymbolView
                  name={sfName ?? 'house'}
                  size={ICON_SIZE}
                  tintColor={color}
                  style={{ width: ICON_SIZE, height: ICON_SIZE }}
                />
                <Text
                  className={`text-[10px] ${isFocused ? 'font-bold' : 'font-medium'}`}
                  style={{ color }}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              </Pressable>
            );
          })}
        </View>,
      )}
    </Animated.View>
  );
}
