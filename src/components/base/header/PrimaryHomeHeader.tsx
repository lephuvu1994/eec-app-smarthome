import type { Href } from 'expo-router';
import type { TMenuElement } from '@/components/ui/zeego-native-menu';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { memo, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { BellIcon, SnownyIcon } from '@/components/ui/icons';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { PulseDot } from '../PulseDot';

export const PrimaryHeaderHome: React.FC = memo(() => {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();

  const headerRightMenu: TMenuElement[] = useMemo(() => [
    {
      key: 'add device',
      title: translate('base.addDevice'),
      icon: { ios: 'plus' },
      onPress: () => router.push('/(app)/(mobile)/add-device' as Href),
    },
    {
      key: 'add scene',
      title: translate('base.addScene'),
      icon: { ios: 'plus' },
      onPress: () => router.push('/(app)/(mobile)/add-scene' as Href),
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
  ], []);

  return (
    <View
      className="w-full flex-row gap-2 px-4"
      style={{
        paddingTop: insets.top,
      }}
    >
      <View className="flex-1 flex-col">
        <TouchableOpacity className="flex-row items-center gap-2.5" onPress={() => { }}>
          <AntDesign name="home" size={18} color={theme === ETheme.Light ? '#1B1B1B' : '#FFFFFF'} />
          <Text className="text-[#1B1B1B] dark:text-white">Nhà của tôi</Text>
          <AntDesign className="mt-1" name="caret-down" size={16} color={theme === ETheme.Light ? '#1B1B1B' : '#FFFFFF'} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-1">
          <SnownyIcon />
          <Text className="text-sm text-[#06B6D4] dark:text-[#06B6D4]">20°C</Text>
        </View>
      </View>
      <View className="flex-1 flex-row justify-end gap-2">
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
      </View>
    </View>
  );
});
