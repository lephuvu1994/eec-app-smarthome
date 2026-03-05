import type { ETheme } from '@/types/base';

import { Stack } from 'expo-router';
import { useUniwind } from 'uniwind';
import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';

export default function WelcomeLayout() {
  const { theme } = useUniwind();
  return (
    <Stack
      initialRouteName="signIn"
      screenOptions={{
        contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
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
