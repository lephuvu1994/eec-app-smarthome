/* eslint-disable react-compiler/react-compiler */
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { SFSymbol } from 'expo-symbols';
import type { LayoutChangeEvent } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useSegments } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
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

// Indicator geometry — derived from TAB_BAR_HEIGHT
const PILL_MARGIN_X = 2;
const PILL_PADDING_Y = 2;
const PILL_HEIGHT = TAB_BAR_HEIGHT - PILL_PADDING_Y * 2 - 16; // subtract padding + label space
const PILL_RADIUS = PILL_HEIGHT / 2;
const SHADOW_OFFSET_Y = 0;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type TTabConfig = {
  sfSymbol: SFSymbol;
  sfSymbolFocused: SFSymbol;
  mdIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  mdIconFocused: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
};

// ──────────────────────────────────────────────
// Tab Config
// ──────────────────────────────────────────────

const TAB_CONFIG: Record<string, TTabConfig> = {
  '(room)': {
    sfSymbol: 'door.left.hand.open',
    sfSymbolFocused: 'door.left.hand.open',
    mdIcon: 'door-open',
    mdIconFocused: 'door-open',
    title: translate('app.roomTab', { defaultValue: 'Rooms' }),
  },
  '(home)': {
    sfSymbol: 'house',
    sfSymbolFocused: 'house.fill',
    mdIcon: 'home-outline',
    mdIconFocused: 'home',
    title: translate('app.favoriteTab', { defaultValue: 'Favorite' }),
  },
  '(smart)': {
    sfSymbol: 'square.split.bottomrightquarter',
    sfSymbolFocused: 'square.split.bottomrightquarter.fill',
    mdIcon: 'view-grid-outline',
    mdIconFocused: 'view-grid',
    title: translate('app.smartTab', { defaultValue: 'Smart' }),
  },
  '(settings)': {
    sfSymbol: 'gearshape',
    sfSymbolFocused: 'gearshape.fill',
    mdIcon: 'cog-outline',
    mdIconFocused: 'cog',
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

function SkiaActiveIndicator({
  tabCount,
  activeIndex,
  containerWidth,
  isDark,
}: {
  tabCount: number;
  activeIndex: number;
  containerWidth: number;
  isDark: boolean;
}) {
  const tabWidth = containerWidth / Math.max(tabCount, 1);
  const targetX = activeIndex * tabWidth;

  const translateX = useSharedValue(targetX);

  useEffect(() => {
    if (containerWidth === 0) {
      return;
    }
    translateX.value = withTiming(targetX, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (containerWidth === 0) {
    return null;
  }

  const pw = tabWidth - PILL_MARGIN_X * 2;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          width: tabWidth,
          height: TAB_BAR_HEIGHT,
        },
        slideStyle,
      ]}
    >
      <Canvas style={{ flex: 1 }}>
        {/* Shadow — slightly offset down for floating depth */}
        <RoundedRect
          x={PILL_MARGIN_X}
          y={PILL_PADDING_Y + SHADOW_OFFSET_Y}
          width={pw}
          height={PILL_HEIGHT}
          r={PILL_RADIUS}
          color={isDark ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.06)'}
        />

        {/* Body — vertical gradient, brighter on top for curvature */}
        <RoundedRect x={PILL_MARGIN_X} y={PILL_PADDING_Y} width={pw} height={PILL_HEIGHT} r={PILL_RADIUS}>
          <LinearGradient
            start={vec(0, PILL_PADDING_Y)}
            end={vec(0, PILL_PADDING_Y + PILL_HEIGHT)}
            colors={
              isDark
                ? ['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.08)']
                : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
            }
          />
        </RoundedRect>

        {/* Border ring — gradient stroke for glass edge */}
        <RoundedRect
          x={PILL_MARGIN_X + 0.5}
          y={PILL_PADDING_Y + 0.5}
          width={pw - 1}
          height={PILL_HEIGHT - 1}
          r={PILL_RADIUS - 0.5}
          color="transparent"
          style="stroke"
          strokeWidth={0.75}
        >
          <LinearGradient
            start={vec(0, PILL_PADDING_Y)}
            end={vec(0, PILL_PADDING_Y + PILL_HEIGHT)}
            colors={
              isDark
                ? ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.04)']
                : ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.5)']
            }
          />
        </RoundedRect>
      </Canvas>
    </Animated.View>
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

  const targetTranslateY = isInRoomDetail ? TAB_BAR_HEIGHT + insets.bottom : 0;
  const slideTranslateY = useSharedValue(targetTranslateY);

  useEffect(() => {
    slideTranslateY.value = withTiming(targetTranslateY, {
      duration: SLIDE_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetTranslateY, slideTranslateY]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideTranslateY.value }],
  }));

  const onTabRowLayout = useCallback((e: LayoutChangeEvent) => {
    setTabRowWidth(e.nativeEvent.layout.width);
  }, []);

  const orderedRoutes = getOrderedRoutes(state.routes);

  const activeOrderedIndex = orderedRoutes.findIndex((route) => {
    const realIndex = state.routes.findIndex(r => r.key === route.key);
    return state.index === realIndex;
  });

  const glassWidth = WIDTH - 16 * 2;
  const pb = Math.max(insets.bottom - 16, Platform.OS === 'android' ? 12 : 4);

  const renderBackground = (children: React.ReactNode) => {
    if (HAS_LIQUID_GLASS) {
      return (
        <View style={{ paddingBottom: pb, paddingHorizontal: 16 }}>
          <GlassView
            className="self-center overflow-hidden"
            style={{ width: glassWidth, borderRadius: 48, padding: 4, overflow: 'hidden' }}
            glassEffectStyle="regular"
            colorScheme={isDark ? 'dark' : 'light'}
          >
            {children}
          </GlassView>
        </View>
      );
    }

    if (Platform.OS === 'ios') {
      return (
        <BlurView
          className="overflow-hidden border-t border-gray-500/15 pt-1.5"
          style={{ paddingBottom: pb }}
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
        style={{ paddingBottom: pb }}
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
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
      style={[slideStyle]}
    >
      {renderBackground(
        <View className="relative flex-row items-center" onLayout={onTabRowLayout}>
          <SkiaActiveIndicator
            tabCount={orderedRoutes.length}
            activeIndex={activeOrderedIndex}
            containerWidth={tabRowWidth}
            isDark={isDark}
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

            const mdName = config
              ? (isFocused ? config.mdIconFocused : config.mdIcon)
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
                  fallback={<MaterialCommunityIcons name={mdName ?? 'home'} size={ICON_SIZE} color={color} />}
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
