import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, showError, Text, TouchableOpacity, View } from '@/components/ui';
import { useUserManager } from '@/features/auth/user-store';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, userName, avatar, email, phone } = useUserManager();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme } = useUniwind();
  const headerHeight = useHeaderHeight();

  const hasName = Boolean(userName && userName.trim().length > 0);
  const displayContact = phone ?? email ?? '';

  const handleLogout = () => {
    Alert.alert(
      translate('settings.logout'),
      translate('settings.logoutConfirm'),
      [
        { text: translate('base.cancel'), style: 'cancel' },
        {
          text: translate('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await signOut();
            }
            catch (e) {
              showError(e as any);
            }
            finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + 32 }}
        >
          {/* ─── Avatar ─── */}
          <View className="mb-6 items-center px-4">
            <View className="mb-4">
              <TouchableOpacity activeOpacity={0.8}>
                {avatar && avatar.length > 0
                  ? (
                      <Image
                        source={{ uri: avatar }}
                        className="size-24 rounded-full"
                        contentFit="cover"
                      />
                    )
                  : (
                      <View className="size-24 items-center justify-center rounded-full bg-neutral-200">
                        <MaterialCommunityIcons name="account" size={52} color="#A3A3A3" />
                      </View>
                    )}
                {/* Camera overlay */}
                <View className="absolute right-0 bottom-0 size-7 items-center justify-center rounded-full bg-neutral-700">
                  <MaterialCommunityIcons name="camera-outline" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text className="text-xl font-bold text-[#1B1B1B] dark:text-white">
              {hasName ? userName : translate('settings.defaultUser')}
            </Text>
            {displayContact
              ? <Text className="mt-0.5 text-sm text-neutral-500">{displayContact}</Text>
              : null}
          </View>

          {/* ─── Info Card ─── */}
          <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            {/* Name row */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-3 p-4"
              onPress={() => { }}
            >
              <View className="size-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
                <MaterialCommunityIcons name="account-outline" size={20} color={theme === ETheme.Dark ? '#FFFFFF' : '#525252'} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-400">{translate('formAuth.firstName')}</Text>
                <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                  {hasName ? userName : '—'}
                </Text>
              </View>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={theme === ETheme.Dark ? '#9CA3AF' : '#A3A3A3'} />
            </TouchableOpacity>

            <View className="ml-[60px] h-px bg-neutral-100 dark:bg-neutral-700" />

            {/* Phone row */}
            <View className="flex-row items-center gap-3 p-4">
              <View className="size-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
                <MaterialCommunityIcons name="phone-outline" size={20} color={theme === ETheme.Dark ? '#FFFFFF' : '#525252'} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-400">{translate('formAuth.phoneNumber')}</Text>
                <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                  {phone ?? '—'}
                </Text>
              </View>
            </View>

            <View className="ml-[60px] h-px bg-neutral-100 dark:bg-neutral-700" />

            {/* Email row */}
            <View className="flex-row items-center gap-3 p-4">
              <View className="size-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
                <MaterialCommunityIcons name="email-outline" size={20} color={theme === ETheme.Dark ? '#FFFFFF' : '#525252'} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-neutral-400">{translate('formAuth.emailTitle')}</Text>
                <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                  {email ?? '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Logout ─── */}
          <View className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-3 p-4"
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <View className="size-9 items-center justify-center rounded-xl bg-red-50">
                <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-[15px] font-medium text-red-500">
                {isLoggingOut ? '...' : translate('settings.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
