import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';
import { ETheme } from '@/types/base';
import { Image } from 'expo-image';
import { useUniwind } from 'uniwind';
import { HomeScreenWrapper } from './wrapper/home-screen-wrapper';
import { StyleSheet } from 'react-native'

export function HomeScreen() {
  const { theme } = useUniwind();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={theme === ETheme.Dark ? require('@@/assets/base/background-dark.png') : require('@@/assets/base/background-light.png')}
          style={[{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }, StyleSheet.absoluteFillObject]}
          contentFit="cover"
        />
        <PrimaryHeaderHome />
        <HomeScreenWrapper className="flex-1 pt-2" />
      </View>
    </BaseLayout>
  );
}
