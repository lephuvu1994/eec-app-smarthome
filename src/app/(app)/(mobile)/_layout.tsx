import { Stack } from 'expo-router';
import { useUniwind } from 'uniwind';
import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export default function MobileLayout() {
  const { theme } = useUniwind();
  const headerTintColor = theme === ETheme.Dark ? '#ffffff' : '#1B1B1B';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-device" />
      <Stack.Screen
        name="device/[id]"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="device/[id]/info"
        options={{
          headerShown: false,
          headerTransparent: true,
          headerShadowVisible: false,
          title: '',
          headerTintColor,
          headerBackTitle: translate('base.back'),
        }}
      />
      <Stack.Screen
        name="device/[id]/schedule"
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="device/[id]/timer"
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home-management"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="device-management"
        options={{
          headerShown: false,
          headerTransparent: true,
          title: translate('base.deviceManagement'),
          headerTitleAlign: 'center',
          headerTintColor,
          headerTitleStyle: { color: headerTintColor, fontWeight: '600' },
          headerBackTitle: translate('base.back'),
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="floor-detail"
        options={{
          headerShown: false,
          headerTransparent: true,
          title: '',
          headerTintColor,
          headerBackTitle: translate('base.back'),
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="room-detail"
        options={{
          headerShown: false,
          headerTransparent: true,
          title: '',
          headerTintColor,
          headerBackTitle: translate('base.back'),
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="assign-rooms"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="assign-room-entities"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="assign-room-scenes"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
    </Stack>
  );
}
