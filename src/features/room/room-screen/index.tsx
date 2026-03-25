import { Image } from 'expo-image';
import { useUniwind } from 'uniwind';
import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';
import { ETheme } from '@/types/base';

import { RoomScreenWrapper } from '../wrapper/room-screen-wrapper';

export function RoomScreen() {
  const { theme } = useUniwind();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={theme === ETheme.Dark ? require('@@/assets/base/background-dark.webp') : require('@@/assets/base/background-light.webp')}
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
        <RoomScreenWrapper className="flex-1 pt-2" />
      </View>
    </BaseLayout>
  );
}
