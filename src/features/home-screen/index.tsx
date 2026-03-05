import { Image } from 'expo-image';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { ETheme } from '@/types/base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SnownyIcon, BellIcon } from '@/components/ui/icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { PulseDot } from '@/components/base/PulseDot';
import { HomeScreenWrapper } from './wrapper/home-screen-wrapper';

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
          contentFit='contain'
        />
        <View className='w-full px-4 flex-row gap-2' style={{
          marginTop: insets.top + 16
        }}>
          <View className='flex-col flex-1'>
            <TouchableOpacity className="flex-row gap-2.5 items-center" onPress={() => { }}>
              <AntDesign name="home" size={18} color={theme === ETheme.Light ? "#1B1B1B" : "#FFFFFF"} />
              <Text className="text-[#1B1B1B] dark:text-white">Nhà của tôi</Text>
              <AntDesign className="mt-1" name="caret-down" size={16} color={theme === ETheme.Light ? "#1B1B1B" : "#FFFFFF"} />
            </TouchableOpacity>
            <View className="gap-1 items-center flex-row ">
              <SnownyIcon />
              <Text className="text-sm text-[#06B6D4] dark:text-[#06B6D4]">20°C</Text>
            </View>
          </View>
          <View className='flex-1 justify-end flex-row gap-2'>
            <View className="relative w-8 h-8 bg-white/40 dark:text-black/40 rounded-full justify-center items-center">
              <BellIcon color={theme === ETheme.Light ? "#737373" : "#FFFFFF"} />
              <PulseDot
                color="#22C55E"
                size={8}
                duration={1200}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6
                }}
              />
            </View>

            <View className="w-8 h-8 bg-white/40 dark:text-black/40 rounded-full justify-center items-center">
              <AntDesign name="plus" size={16} color={theme === ETheme.Light ? "#737373" : "#FFFFFF"} />
            </View>
          </View>
        </View>
        <HomeScreenWrapper />
      </View>
    </BaseLayout>
  );
}
