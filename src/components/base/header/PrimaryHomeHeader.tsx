import type { Href } from 'expo-router';
import type { TMenuElement } from '@/components/ui/NativeMenu';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { memo, useMemo } from 'react';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { BellIcon, SnownyIcon } from '@/components/ui/icons';
import { NativeMenu } from '@/components/ui/NativeMenu';
import { EHomeRole } from '@/features/auth/types/response';
import { useUserManager } from '@/features/auth/user-store';
import { HomeTimelinePopover } from '@/features/home-screen/components/modals/home-timeline-popover';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';
import { PulseDot } from '../PulseDot';

export const PrimaryHeaderHome: React.FC = memo(() => {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();

  // ─── Home data ─────────────────────────────
  const homes = useHomeStore(s => s.homes);
  const { id: currentUserId } = useUserManager();
  const selectedHome = useHomeStore(s => s.selectedHome);
  const selectedHomeId = useHomeStore(s => s.selectedHomeId);
  const setSelectedHome = useHomeStore(s => s.setSelectedHome);

  // Removed old useEffect block that synced homes fetched from redundant API,
  // because _layout.tsx Hydration now fetches from /auth/me and writes into useHomeStore(s => s.homes).

  // ─── Home selection menu ───────────────────
  const homeMenuItems: TMenuElement[] = useMemo(() => {
    if (!homes?.length)
      return [];
    return homes.map(home => ({
      key: home.id,
      title: home.name,
      icon: { ios: selectedHomeId === home.id ? 'checkmark' : 'house' },
      onPress: () => {
        const role = home.ownerId === currentUserId ? EHomeRole.OWNER : EHomeRole.MEMBER;
        setSelectedHome(home, role);
      },
    }));
  }, [homes, selectedHomeId, currentUserId, setSelectedHome]);

  // ─── Header right menu ─────────────────────
  const headerRightMenu: TMenuElement[] = useMemo(() => [
    {
      key: 'add device',
      title: translate('base.addDevice'),
      icon: { ios: 'externaldrive.badge.plus' },
      androidIconName: 'devices',
      onPress: () => router.push('/(app)/(mobile)/add-device' as Href),
    },
    {
      key: 'add scene',
      title: translate('base.addScene'),
      icon: { ios: 'theatermasks.fill' },
      androidIconName: 'lightning-bolt',
      onPress: () => router.push('/(app)/(mobile)/(scene)/hub' as Href),
    },
    {
      type: 'separator',
      key: 'sep-1',
    },
    {
      key: 'scan',
      title: translate('base.scan'),
      icon: { ios: 'qrcode.viewfinder' },
      androidIconName: 'qrcode-scan',
      onPress: () => router.push('/(app)/(mobile)/(home)/scan' as Href),
    },
  ], []);

  return (
    <View
      className="w-full flex-row gap-2 px-4"
      style={{
        paddingTop: insets.top > 0 ? insets.top : StatusBar.currentHeight,
      }}
    >
      <View className="flex-1 flex-col">
        {/* Home selector */}
        <NativeMenu
          triggerComponent={(
            <TouchableOpacity className="flex-row items-center gap-2.5">
              <AntDesign name="home" size={18} color={theme === ETheme.Light ? '#1B1B1B' : '#FFFFFF'} />
              <Text className="text-[#1B1B1B] dark:text-white">
                {selectedHome?.name ?? translate('base.home')}
              </Text>
              <AntDesign className="mt-1" name="caret-down" size={16} color={theme === ETheme.Light ? '#1B1B1B' : '#FFFFFF'} />
            </TouchableOpacity>
          )}
          elements={homeMenuItems}
        />
        <View className="flex-row items-center gap-1">
          <SnownyIcon />
          <Text className="text-sm text-[#06B6D4] dark:text-[#06B6D4]">20°C</Text>
        </View>
      </View>
      <View className="flex-1 flex-row justify-end gap-2">
        <HomeTimelinePopover
          homeId={selectedHomeId ?? ''}
          trigger={(
            <View className="relative size-10 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
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
          )}
        />

        <NativeMenu
          triggerComponent={(
            <View pointerEvents="none" className="size-10 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
              <AntDesign name="plus" size={16} color={theme === ETheme.Light ? '#737373' : '#FFFFFF'} />
            </View>
          )}
          elements={headerRightMenu}
        />
      </View>
    </View>
  );
});
