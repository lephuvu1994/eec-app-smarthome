import Env from '@env';
import { Image } from 'expo-image';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, View } from '@/components/ui';
import { ETheme } from '@/types/base';

export function SettingsScreen() {
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
        <View></View>
      </View>
    </BaseLayout>
  );
}
