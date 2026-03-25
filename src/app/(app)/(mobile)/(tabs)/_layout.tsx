import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useSegments } from 'expo-router';
import { Platform } from 'react-native';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

function MobileLayout() {
  const { theme } = useUniwind();
  const segments = useSegments() as string[];

  // Hide tab bar when navigating deeper into a nested stack inside a tab
  const roomTabSegmentIdx = segments.indexOf('(room)');
  const isInRoomDetail = roomTabSegmentIdx !== -1 && segments.length > roomTabSegmentIdx + 1;

  const isDark = theme === ETheme.Dark;
  const bgColor = isDark ? colors.charcoal[950] : colors.white;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.neon,
        tabBarInactiveTintColor: isDark ? '#888' : '#999',
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)',
          ...(isInRoomDetail && { display: 'none' }),
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      {/* (room) — intentionally NOT registered as Tabs.Screen.
          This avoids the native screen wrapper that blocks Reanimated sharedTransitionTag.
          The tab still appears via file-based routing with default icon. */}

      <Tabs.Screen
        name="(home)"
        options={{
          title: translate('app.favoriteTab'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(smart)"
        options={{
          title: translate('app.smartTab'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightbulb-group-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: translate('app.settingTab'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default MobileLayout;
