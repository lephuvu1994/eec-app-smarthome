import { Stack } from 'expo-router';

import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';

export default function WelcomeLayout() {
  return (
    <Stack
      initialRouteName="signIn"
      screenOptions={{
      // 1. Ép nền của toàn bộ các màn hình trong Stack thành trong suốt
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen
        name="signUp"
        options={{
          headerBackTitle: translate('base.back'),
          headerTintColor: colors.white,
          headerTransparent: true,
          title: '',
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          headerTransparent: true,
          headerShown: true,
          headerTintColor: colors.white,
          title: '',
        }}
      />
    </Stack>
  );
}
