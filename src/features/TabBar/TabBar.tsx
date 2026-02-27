import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';

export function TabBar() {
  const { theme } = useUniwind();

  return (
    <NativeTabs tintColor={theme === 'dark' ? colors.white : colors.primary[500]}>
      <NativeTabs.Trigger name="(room)">
        <Label>{translate('app.roomTab')}</Label>
        <Icon
          sf={{
            default: 'square.split.bottomrightquarter',
            selected: 'square.split.bottomrightquarter.fill',
          }}
          drawable="custom_home_drawable"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(home)">
        <Label>{translate('app.favoriteTab')}</Label>
        <Icon sf={{ default: 'house.badge.wifi', selected: 'house.badge.wifi.fill' }} drawable="custom_home_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(smart)">
        <Label>{translate('app.smartTab')}</Label>
        <Icon
          sf={{
            default: 'square.split.bottomrightquarter',
            selected: 'square.split.bottomrightquarter.fill',
          }}
          drawable="custom_home_drawable"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <Label>{translate('app.settingTab')}</Label>
        <Icon
          sf={{
            default: 'gear',
            selected: 'gear.badge.checkmark',
          }}
          drawable="custom_home_drawable"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};
