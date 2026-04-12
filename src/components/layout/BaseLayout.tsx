import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useUniwind } from 'uniwind';

import { FullLayout } from '@/components/layout/FullLayout';
import { ETheme } from '@/types/base';

export function BaseLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useUniwind();

  return (
    <FullLayout>
      <View className="flex-1" style={{ backgroundColor: theme === ETheme.Dark ? '#09090B' : '#F9FAFB' }}>
        <Image
          source={
            theme === ETheme.Dark
              ? require('@@/assets/base/background-dark.webp')
              : require('@@/assets/base/background-light.webp')
          }
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="memory"
        />
        <View className="flex-1">
          {children}
        </View>
      </View>
    </FullLayout>
  );
}
