import type { Href } from 'expo-router';
import type { TMenuElement } from '@/components/ui/zeego-native-menu';
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useUniwind } from 'uniwind';
import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';
import { PulseDot } from '@/components/base/PulseDot';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';
import { BellIcon } from '@/components/ui/icons';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { HomeScreenWrapper } from './wrapper/home-screen-wrapper';

export function HomeScreen() {
  const { theme } = useUniwind();

  const headerRightMenu: TMenuElement[] = [
    {
      key: 'add device',
      title: translate('base.addDevice'),
      icon: { ios: 'plus' },
      onPress: () => router.push('/(app)/(mobile)/(home)/add-device' as Href),
    },
    {
      key: 'add scene',
      title: translate('base.addScene'),
      icon: { ios: 'plus' },
      onPress: () => router.push('/(app)/(mobile)/(home)/add-scene' as Href),
    },
    {
      type: 'separator',
      key: 'sep-1',
    },
    {
      key: 'scan',
      title: translate('base.scan'),
      icon: { ios: 'trash' },
      isDestructive: true,
      onPress: () => router.push('/(app)/(mobile)/(home)/scan' as Href),
    },
  ];

  const rightHeader = () => {
    return (
      <>
        <View className="relative size-8 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
          <BellIcon color={theme === ETheme.Light ? '#737373' : '#FFFFFF'} />
          <PulseDot
            color="#22C55E"
            size={8}
            duration={1200}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
            }}
          />
        </View>

        <ZeegoNativeMenu
          triggerComponent={(
            <View pointerEvents="none" className="size-8 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
              <AntDesign name="plus" size={16} color={theme === ETheme.Light ? '#737373' : '#FFFFFF'} />
            </View>
          )}
          elements={headerRightMenu}
        />
      </>
    );
  };

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
        <PrimaryHeaderHome rightHeader={rightHeader} />
        <HomeScreenWrapper className="flex-1 pt-2" />
      </View>
    </BaseLayout>
  );
}
