import { Stack } from 'expo-router';
import { useUniwind } from 'uniwind';
import { colors, IS_IOS, Text, View, WIDTH } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
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
        name="home-management"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          headerTitle: () => (
            <View className="items-center justify-center" style={{ width: WIDTH - 2 * BASE_SPACE_HORIZONTAL - (36 * 2 + BASE_SPACE_HORIZONTAL), paddingRight: 36 }}>
              <Text style={{ fontSize: IS_IOS ? 17 : 20, fontWeight: IS_IOS ? '600' : '500', color: headerTintColor }}>
                {translate('base.roomManagement')}
              </Text>
            </View>
          ),
          headerTintColor,
          headerBackTitle: translate('base.back'),
          // Placeholder to reserve space — route file overrides with actual ZeegoNativeMenu
          headerRight: () => <View className="size-9" />,
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
      <Stack.Screen
        name="device-management"
        options={{
          headerShown: true,
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
          headerShown: true,
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
          headerShown: true,
          headerTransparent: true,
          title: '',
          headerTintColor,
          headerBackTitle: translate('base.back'),
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
      />
    </Stack>
  );
}
