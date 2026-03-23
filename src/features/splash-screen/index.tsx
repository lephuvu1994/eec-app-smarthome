import Env from '@env';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { ETheme } from '@/types/base';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();

  return (
    <View className="relative w-full flex-1 items-center justify-center">
      <FocusAwareStatusBar hidden />
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
      <View
        className="absolute w-full flex-1 items-center justify-start"
        style={{
          top: insets.top,
          bottom: insets.bottom,
          left: insets.left,
          right: insets.right,
        }}
      >

        <View className="h-2/3 w-full">
          <View className="relative h-full w-full items-center justify-center">
            <Image
              source={require('@@/assets/splash-screen/icon1.png')}
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
            <Image
              source={require('@@/assets/splash-screen/icon2.png')}
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
            <Image
              source={require('@@/assets/splash-screen/icon3.png')}
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
            <Image
              source={require('@@/assets/splash-screen/arrow-select.png')}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                bottom: 0,
              }}
              contentFit="contain"
            />
            <Image
              source={require('@@/assets/base/icon-wrapper-full.png')}
              style={{
                width: 160,
                height: 46,
              }}
              contentFit="contain"
            />
          </View>
        </View>

        {/* --- VERSION --- */}
        <View className="absolute bottom-0">
          <View className="justify-end overflow-hidden">
            <Text className="text-sm font-semibold text-[#A5A5A5] dark:text-white">
              v
              {Env.EXPO_PUBLIC_VERSION}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
