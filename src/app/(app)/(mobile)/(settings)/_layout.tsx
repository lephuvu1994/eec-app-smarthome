import type { Href } from 'expo-router';
import { router, Stack } from 'expo-router';

import { useMemo } from 'react';

import { colors } from '@/components/ui';
import { Settings } from '@/components/ui/icons';
import { MenuNative } from '@/components/ui/menu-native';
import { NativeButton } from '@/components/ui/native-button';
import { translate } from '@/lib/i18n';
import { useUniwind } from 'uniwind';
import { ETheme } from '@/types/base';

function SettingScreen() {
  const { theme } = useUniwind();
  const onPressMenu = (route: string) => {
    if (route === 'memberManager') {
      router.push(`/(app)/(settings)/${route}/` as Href);
    }
    else {
      router.push(`/(app)/(settings)/${route}` as Href);
    }
  };
  const listMenu: any[] = useMemo(() => {
    const drawNewListTeam = [
      {
        key: 'integration',
        element: (
          <NativeButton onPress={() => onPressMenu('setupIntegration')}>
            {translate('settings.integration')}
          </NativeButton>
        ),
      },
      {
        key: 'listMember',
        element: (
          <NativeButton onPress={() => onPressMenu('listMember')}>{translate('settings.listMember')}</NativeButton>
        ),
      },
    ];
    return drawNewListTeam;
  }, []);

  return (
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] } }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerTransparent: true,
            title: translate('app.settingTab'),
            headerTitleAlign: 'center',
            headerRight: () => {
              return (
                <MenuNative
                  containerStyle={{ width: 40, height: 24 }}
                  triggerComponent={<Settings color={colors.primary[500]} />}
                  listItem={listMenu}
                />
              );
            },
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
        <Stack.Screen
          name="profile"
          options={{
            presentation: 'card',
            headerShown: true,
            headerTransparent: true,
            title: translate('settings.profileScreen.title'),
          }}
        />
      </Stack>
  );
}

export default SettingScreen;
