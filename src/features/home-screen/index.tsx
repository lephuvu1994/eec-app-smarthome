import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { PulseDot } from '@/components/base/PulseDot';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { BellIcon, SnownyIcon } from '@/components/ui/icons';
import { ETheme } from '@/types/base';
import { HomeScreenWrapper } from './wrapper/home-screen-wrapper';
import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';

export function HomeScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();

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
        <HomeScreenWrapper className="flex-1 pt-2" />
      </View>
    </BaseLayout>
  );
}
