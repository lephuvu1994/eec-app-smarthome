import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function TabBar() {
  const { theme } = useUniwind();

  return (
    <NativeTabs
      tintColor={colors.neon}
      backgroundColor={theme === ETheme.Dark ? colors.charcoal[950] : colors.white}
    >
      <NativeTabs.Trigger name="(room)">
        <NativeTabs.Trigger.Label>{translate('app.roomTab')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'square.split.bottomrightquarter',
            selected: 'square.split.bottomrightquarter.fill',
          }}
          drawable="custom_home_drawable"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>{translate('app.favoriteTab')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house.badge.wifi', selected: 'house.badge.wifi.fill' }} drawable="custom_home_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(smart)">
        <NativeTabs.Trigger.Label>{translate('app.smartTab')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'square.split.bottomrightquarter',
            selected: 'square.split.bottomrightquarter.fill',
          }}
          drawable="custom_home_drawable"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Label>{translate('app.settingTab')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
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

