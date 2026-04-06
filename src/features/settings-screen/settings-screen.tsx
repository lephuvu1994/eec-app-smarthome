import type { Href } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { BASE_TAB_HEIGHT, EXTRA_GLASS_SPACE } from '@/constants';
import { useUserManager } from '@/features/auth/user-store';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export function SettingsScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const { userName, avatar } = useUserManager();
  const headerOffset = useHeaderOffset();

  const hasName = Boolean(userName && userName.trim().length > 0);

  const menuItems: MenuItem[] = [
    {
      key: 'homeManagement',
      label: translate('settings.menu.homeManagement'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-emerald-100">
          <MaterialCommunityIcons name="home-outline" size={20} color="#059669" />
        </View>
      ),
      onPress: () => router.push('/(app)/(mobile)/home-management' as any),
    },
    {
      key: 'account',
      label: translate('settings.menu.account'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-red-100">
          <MaterialCommunityIcons name="account-outline" size={20} color="#EF4444" />
        </View>
      ),
      onPress: () => router.push('/(app)/(mobile)/(settings)/profile' as any),
    },
    {
      key: 'notification',
      label: translate('settings.menu.notification'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-blue-100">
          <MaterialCommunityIcons name="bell-outline" size={20} color="#3B82F6" />
        </View>
      ),
      onPress: () => router.push('/(app)/(mobile)/(settings)/notification' as Href),
    },
    {
      key: 'message',
      label: translate('settings.menu.messageCenter'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-amber-100">
          <MaterialCommunityIcons name="message-outline" size={20} color="#F59E0B" />
        </View>
      ),
      onPress: () => router.push('/(app)/(mobile)/(settings)/message-center' as Href),
    },
    {
      key: 'support',
      label: translate('settings.menu.support'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-emerald-100">
          <MaterialCommunityIcons name="help-circle-outline" size={20} color="#059669" />
        </View>
      ),
      onPress: () => router.push('/(app)/(mobile)/(settings)/support' as any),
    },
  ];

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        {/* Background */}
        <Image
          source={
            theme === ETheme.Dark
              ? require('@@/assets/base/background-dark.webp')
              : require('@@/assets/base/background-light.webp')
          }
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

        <CustomHeader
          title=""
          rightContent={(
            <View className="flex-row items-center gap-2 px-1">
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(app)/(mobile)/(settings)/scan-qr' as any)} className="size-9 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40"><MaterialCommunityIcons name="line-scan" size={20} color={theme === ETheme.Dark ? '#fff' : '#1B1B1B'} /></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(app)/(mobile)/(settings)/general' as any)} className="size-9 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40"><MaterialCommunityIcons name="tune-variant" size={20} color={theme === ETheme.Dark ? '#fff' : '#1B1B1B'} /></TouchableOpacity>
            </View>
          )}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerOffset, paddingBottom: insets.bottom + BASE_TAB_HEIGHT + EXTRA_GLASS_SPACE }}
        >
          {/* ─── Profile Section ─── */}
          <TouchableOpacity
            activeOpacity={0.75}
            className="mb-8 items-center px-4"
            onPress={() => router.push('/(app)/(mobile)/(settings)/profile' as any)}
          >
            {/* Avatar */}
            <View className="mb-3">
              {avatar && avatar.length > 0
                ? (
                    <Image
                      source={{ uri: avatar }}
                      className="size-[88px] rounded-full"
                      contentFit="cover"
                    />
                  )
                : (
                    <View className="size-[88px] items-center justify-center rounded-full bg-neutral-200">
                      <MaterialCommunityIcons name="account" size={48} color="#A3A3A3" />
                    </View>
                  )}
            </View>

            {/* Name only */}
            <Text className="text-xl font-bold text-[#1B1B1B] dark:text-white">
              {hasName ? userName : translate('settings.defaultUser')}
            </Text>
          </TouchableOpacity>

          {/* ─── Energy Card ─── */}
          <View className="relative mx-4 mb-6 overflow-hidden rounded-2xl border border-[#FFFFFF99] shadow-sm dark:border-neutral-700 dark:bg-neutral-800/90">
            {/* --- LỚP NỀN: Hình ảnh (chỉ hiện ở Light mode) --- */}
            {theme !== ETheme.Dark && (
              <Image
                source={require('@@/assets/settings/enery-bg.png')}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
              />
            )}

            {/* --- LỚP NỘI DUNG: TRÊN CÙNG --- */}
            <View className="relative z-10">
              {/* Card Header */}
              <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Text className="text-sm font-medium text-black dark:text-white">
                  {translate('settings.energyCard.title')}
                </Text>
                <View className="flex-row items-center gap-1">
                  <View className="size-2 rounded-full bg-emerald-500" />
                  <Text className="text-xs font-medium text-emerald-500">
                    {translate('settings.energyCard.live')}
                  </Text>
                </View>
              </View>

              {/* Primary Value */}
              <View className="px-4 pb-3">
                <Text className="text-[38px] leading-tight font-bold text-[#1B1B1B] dark:text-white">
                  2.1
                  {' '}
                  <Text className="text-2xl font-semibold text-[#1B1B1B] dark:text-white">KW</Text>
                </Text>
                <Text className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-300">
                  {translate('settings.energyCard.currentUsage')}
                </Text>
              </View>

              {/* Stats Row */}
              <View className="flex-row border-t border-neutral-100 bg-white/60 dark:border-white/10 dark:bg-black/30">
                {/* Left stat */}
                <View className="flex-1 flex-row items-center gap-2.5 px-4 py-3">
                  <View className="size-9 items-center justify-center rounded-full bg-neutral-200 dark:bg-white/20">
                    <MaterialCommunityIcons name="lightning-bolt" size={18} color={theme === ETheme.Dark ? '#FFFFFF' : '#525252'} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-[#1B1B1B] dark:text-white">48 KWh</Text>
                    <Text className="text-xs text-neutral-400 dark:text-neutral-300">
                      {translate('settings.energyCard.last24h')}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="my-3 w-px bg-neutral-200 dark:bg-white/20" />

                {/* Right stat */}
                <View className="flex-1 flex-row items-center gap-2.5 px-4 py-3">
                  <View className="size-9 items-center justify-center rounded-full bg-neutral-200 dark:bg-white/20">
                    <MaterialCommunityIcons name="wallet-outline" size={18} color={theme === ETheme.Dark ? '#FFFFFF' : '#525252'} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-[#1B1B1B] dark:text-white">120.000 đ</Text>
                    <Text className="text-xs text-neutral-400 dark:text-neutral-300">
                      {translate('settings.energyCard.estimatedCost')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* ─── Menu List ─── */}
          <View className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            {menuItems.map((item, idx) => (
              <View key={item.key}>
                <TouchableOpacity
                  onPress={item.onPress}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 px-4 py-3.5"
                >
                  {item.icon}
                  <Text className="flex-1 text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                    {item.label}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#A3A3A3" />
                </TouchableOpacity>
                {idx < menuItems.length - 1 && (
                  <View className="ml-[64px] h-px bg-neutral-100 dark:bg-neutral-700" />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
