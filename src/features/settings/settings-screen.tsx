import Env from '@env';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, View } from '@/components/ui';
import { useUserManager } from '@/features/auth/user-store';
import { LanguageItem } from '@/features/settings/components/language-item';
import { ThemeItem } from '@/features/settings/components/theme-item';
import { AccountItem } from './components/account-item';
import { SettingsContainer } from './components/settings-container';
import { SettingsItem } from './components/settings-item';
import { Image } from "expo-image"
import { useUniwind } from 'uniwind';
import { ETheme } from '@/types/base';

export function SettingsScreen() {
  const userState = useUserManager();
  const { theme } = useUniwind()

  const fullName = userState.userName;

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={theme === ETheme.Dark ? require('@@/assets/base/background-dark.png') : require('@@/assets/base/background-light.png')}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          contentFit="contain"
        />
        <ScrollView style={{ height: '100%', width: '100%' }}>
          <View className="w-full flex-1 gap-4 px-4">
            <SettingsContainer title="settings.account">
              <AccountItem fullName={fullName} email={userState.email || userState.phone || ''} isAccountDetail={false} />
            </SettingsContainer>

            <SettingsContainer title="settings.generale">
              <SettingsItem
                text="settings.systemTab"
                onPress={() => { }}
                value={Env.EXPO_PUBLIC_VERSION}
              />
              <LanguageItem />
              <ThemeItem />
            </SettingsContainer>

            <SettingsContainer title="settings.about">
              <SettingsItem text="settings.app_name" value={Env.EXPO_PUBLIC_NAME} />
              <SettingsItem text="settings.version" value={`${Env.EXPO_PUBLIC_VERSION} (${Env.EXPO_PUBLIC_APP_ENV})`} />
            </SettingsContainer>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
