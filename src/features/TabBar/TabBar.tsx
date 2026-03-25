import { useSegments } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function TabBar() {
  const { theme } = useUniwind();
  const segments = useSegments() as string[];

  // Hide tab bar when navigating deeper into a nested stack inside a tab
  const roomTabSegmentIdx = segments.indexOf('(room)');
  const isInRoomDetail = roomTabSegmentIdx !== -1 && segments.length > roomTabSegmentIdx + 1;

  return (
    <NativeTabs
      tintColor={colors.neon}
      backgroundColor={theme === ETheme.Dark ? colors.charcoal[950] : colors.white}
      hidden={isInRoomDetail}
    >
      {/* (room) trigger intentionally omitted — NativeTabs.Trigger creates a native screen
           wrapper that blocks Reanimated sharedTransitionTag detection.
           The tab still appears with default options via expo-router file-based routing. */}
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
