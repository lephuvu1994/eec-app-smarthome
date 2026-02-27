import type { Href } from 'expo-router';
import { router, Stack } from 'expo-router';

import { useMemo } from 'react';

import { FullLayout } from '@/components/layout/FullLayout';
import { colors } from '@/components/ui';
import { Settings } from '@/components/ui/icons';
import { MenuNative } from '@/components/ui/menu-native';
import { NativeButton } from '@/components/ui/native-button';
import { translate } from '@/lib/i18n';

function SettingScreen() {
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
    <FullLayout>
      <Stack>
        <Stack.Screen
          name="settingTab"
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
      </Stack>
    </FullLayout>
  );
}

export default SettingScreen;
