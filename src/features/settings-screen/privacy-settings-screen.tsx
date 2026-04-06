import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type PermissionItem = {
  key: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  labelKey: string;
  descKey: string;
};

const permissions: PermissionItem[] = [
  {
    key: 'bluetooth',
    icon: 'bluetooth',
    iconColor: '#3B82F6',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    labelKey: 'settings.privacy.bluetooth',
    descKey: 'settings.privacy.bluetoothDesc',
  },
  {
    key: 'siri',
    icon: 'microphone-message',
    iconColor: '#7C3AED',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    labelKey: 'settings.privacy.siri',
    descKey: 'settings.privacy.siriDesc',
  },
  {
    key: 'camera',
    icon: 'camera-outline',
    iconColor: '#059669',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    labelKey: 'settings.privacy.camera',
    descKey: 'settings.privacy.cameraDesc',
  },
  {
    key: 'microphone',
    icon: 'microphone-outline',
    iconColor: '#EF4444',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    labelKey: 'settings.privacy.microphone',
    descKey: 'settings.privacy.microphoneDesc',
  },
  {
    key: 'speechRecognition',
    icon: 'account-voice',
    iconColor: '#F59E0B',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    labelKey: 'settings.privacy.speechRecognition',
    descKey: 'settings.privacy.speechRecognitionDesc',
  },
  {
    key: 'photos',
    icon: 'image-outline',
    iconColor: '#EC4899',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    labelKey: 'settings.privacy.photos',
    descKey: 'settings.privacy.photosDesc',
  },
];

export function PrivacySettingsScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    }
    else {
      Linking.openSettings();
    }
  };

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('settings.general.privacySettings')}
          tintColor={theme === 'dark' ? '#FFF' : '#1B1B1B'}
          leftContent={(
            <HeaderIconButton onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={theme === 'dark' ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
        />

        <Image
          source={
            theme === ETheme.Dark
              ? require('@@/assets/base/background-dark.webp')
              : require('@@/assets/base/background-light.webp')
          }
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="contain"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerOffset + 16, paddingBottom: insets.bottom + 32 }}
        >
          {/* Header description */}
          <View className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <Text className="text-sm/6 text-neutral-600 dark:text-neutral-300">
              {translate('settings.privacy.headerDesc')}
            </Text>
          </View>

          {/* Permissions list */}
          <View className="mx-4 mb-6">
            <Text className="mb-2 px-0 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              {translate('settings.privacy.permissionsTitle')}
            </Text>
            <View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
              {permissions.map((perm, idx) => (
                <View key={perm.key}>
                  <View className="px-4 py-3.5">
                    <View className="flex-row items-center gap-3">
                      <View className={`size-9 items-center justify-center rounded-xl ${perm.iconBg}`}>
                        <MaterialCommunityIcons name={perm.icon as any} size={20} color={perm.iconColor} />
                      </View>
                      <Text className="flex-1 text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                        {translate(perm.labelKey as TxKeyPath)}
                      </Text>
                    </View>
                    <Text className="mt-1 ml-12 text-xs/5 text-neutral-400 dark:text-neutral-500">
                      {translate(perm.descKey as TxKeyPath)}
                    </Text>
                  </View>
                  {idx < permissions.length - 1 && (
                    <View className="ml-[60px] h-px bg-neutral-100 dark:bg-neutral-700" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Open Settings button */}
          <View className="mx-4">
            <TouchableOpacity
              onPress={openAppSettings}
              activeOpacity={0.7}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5"
            >
              <MaterialCommunityIcons name="cog-outline" size={20} color="#fff" />
              <Text className="text-[15px] font-semibold text-white">
                {translate('settings.privacy.openSettings')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
