import { Image } from 'expo-image';
import { useUniwind } from 'uniwind';
import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';
import { ETheme } from '@/types/base';
import { SmartScreenWrapper } from './wrapper/smart-screen-wrapper';

export function SmartScreen() {
  const { theme } = useUniwind();

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
        <PrimaryHeaderHome />
        <SmartScreenWrapper className="pt-4" />
      </View>
    </BaseLayout>
  );
}
