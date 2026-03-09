import type { ETheme } from '@/types/base';

import { Stack } from 'expo-router';

import { colors } from '@/components/ui';
import { Settings } from '@/components/ui/icons';
import { MenuNative } from '@/components/ui/menu-native';
import { translate } from '@/lib/i18n';
import { useUniwind } from 'uniwind';

function SettingScreen() {
  const { theme } = useUniwind();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] } }}>
      <Stack.Screen
        name="index"
        options={{
          headerTransparent: true,
          title: translate('app.settingTab'),
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          headerShown: true,
          headerTransparent: true,
          title: translate('settings.account'),
        }}
      />
    </Stack>
  );
}

export default SettingScreen;
