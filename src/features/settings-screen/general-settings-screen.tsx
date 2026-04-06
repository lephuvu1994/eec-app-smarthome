import type { TxKeyPath } from '@/lib/i18n';
import type { TLanguage } from '@/lib/i18n/resources';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as React from 'react';
import { Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { Modal, useModal } from '@/components/ui/modal';
import { useSelectedTheme } from '@/lib/hooks/use-selected-theme';
import { translate, useSelectedLanguage } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';
import { ETheme } from '@/types/base';

type SectionItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
};

type Section = {
  title: string;
  items: SectionItem[];
};

type OptionItemProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function OptionItem({ label, selected, onPress }: OptionItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-4 py-4 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">{label}</Text>
      {selected && <MaterialCommunityIcons name="check" size={20} color="#65A30D" />}
    </TouchableOpacity>
  );
}

export function GeneralSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const headerOffset = useHeaderOffset();
  const { selectedTheme, setSelectedTheme } = useSelectedTheme();
  const { language, setLanguage } = useSelectedLanguage();

  const themeModal = useModal();
  const languageModal = useModal();
  const tempModal = useModal();
  const displayModal = useModal();

  const {
    allowHaptics,
    setToggleAllowHaptics,
    showCameraPreview,
    showRoomViewExpand,
    setShowCameraPreview,
    setShowRoomViewExpand,
    deviceViewMode,
    setDeviceViewMode,
  } = useConfigManager();

  const toggleHaptics = (val: boolean) => {
    setToggleAllowHaptics(val);
    if (val)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const themeLabel = {
    light: translate('settings.theme.light'),
    dark: translate('settings.theme.dark'),
    system: translate('settings.theme.system'),
  }[selectedTheme] ?? translate('settings.theme.system');

  const languageLabel = {
    vi: translate('settings.language.vietnam'),
    en: translate('settings.language.english'),
  }[language] ?? (language === 'en' ? 'English' : 'Tiếng Việt');

  const displayModeLabel
    = deviceViewMode === 'split'
      ? translate('settings.general.deviceViewModeSplit')
      : translate('settings.general.deviceViewModeGrouped');

  const tempLabel = '°C'; // placeholder

  const sections: Section[] = [
    {
      title: translate('settings.generale'),
      items: [
        {
          key: 'deviceViewMode',
          label: translate('settings.general.deviceViewMode'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <MaterialCommunityIcons name="layers-outline" size={20} color="#F97316" />
            </View>
          ),
          right: (
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {displayModeLabel}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#A3A3A3" />
            </View>
          ),
          onPress: displayModal.present,
        },
        {
          key: 'haptics',
          label: translate('settings.general.haptics'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-violet-100">
              <MaterialCommunityIcons name="vibrate" size={20} color="#7C3AED" />
            </View>
          ),
          right: (
            <Switch
              value={allowHaptics}
              onValueChange={toggleHaptics}
              trackColor={{ false: '#D4D4D4', true: '#A3E635' }}
              thumbColor="#fff"
            />
          ),
        },
        {
          key: 'camera',
          label: translate('settings.general.cameraView'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-sky-100">
              <MaterialCommunityIcons name="camera-outline" size={20} color="#0284C7" />
            </View>
          ),
          right: (
            <Switch
              value={!showCameraPreview}
              onValueChange={() => setShowCameraPreview(!showCameraPreview)}
              trackColor={{ false: '#D4D4D4', true: '#A3E635' }}
              thumbColor="#fff"
            />
          ),
        },
        {
          key: 'roomview',
          label: translate('settings.general.roomView'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-sky-100">
              <MaterialCommunityIcons name="home-outline" size={20} color="#0284C7" />
            </View>
          ),
          right: (
            <Switch
              value={showRoomViewExpand}
              onValueChange={() => setShowRoomViewExpand(!showRoomViewExpand)}
              trackColor={{ false: '#D4D4D4', true: '#A3E635' }}
              thumbColor="#fff"
            />
          ),
        },
        {
          key: 'theme',
          label: translate('settings.theme.title'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-amber-100">
              <MaterialCommunityIcons name="theme-light-dark" size={20} color="#D97706" />
            </View>
          ),
          right: (
            <View className="flex-row items-center gap-1">
              <Text className="text-sm text-neutral-400">{themeLabel}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#A3A3A3" />
            </View>
          ),
          onPress: themeModal.present,
        },

        {
          key: 'language',
          label: translate('settings.language.title'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-emerald-100">
              <MaterialCommunityIcons name="translate" size={20} color="#059669" />
            </View>
          ),
          right: (
            <View className="flex-row items-center gap-1">
              <Text className="text-sm text-neutral-400">{languageLabel}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#A3A3A3" />
            </View>
          ),
          onPress: languageModal.present,
        },
        {
          key: 'temperature',
          label: translate('settings.general.temperatureUnit'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-red-100">
              <MaterialCommunityIcons name="thermometer" size={20} color="#EF4444" />
            </View>
          ),
          right: (
            <View className="flex-row items-center gap-1">
              <Text className="text-sm text-neutral-400">{tempLabel}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#A3A3A3" />
            </View>
          ),
          onPress: tempModal.present,
        },
      ],
    },
    {
      title: translate('settings.about'),
      items: [
        {
          key: 'about',
          label: translate('settings.general.introduction'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-blue-100">
              <MaterialCommunityIcons name="information-outline" size={20} color="#3B82F6" />
            </View>
          ),
          right: <MaterialCommunityIcons name="chevron-right" size={18} color="#A3A3A3" />,
          onPress: () => router.push('/(app)/(mobile)/(settings)/introduction' as any),
        },
        {
          key: 'privacy',
          label: translate('settings.general.privacySettings'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-neutral-100">
              <MaterialCommunityIcons name="shield-account-outline" size={20} color="#525252" />
            </View>
          ),
          right: <MaterialCommunityIcons name="chevron-right" size={18} color="#A3A3A3" />,
          onPress: () => router.push('/(app)/(mobile)/(settings)/privacy-settings' as any),
        },
        {
          key: 'privacyPolicy',
          label: translate('settings.general.privacyPolicy'),
          icon: (
            <View className="size-9 items-center justify-center rounded-xl bg-neutral-100">
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#525252" />
            </View>
          ),
          right: <MaterialCommunityIcons name="chevron-right" size={18} color="#A3A3A3" />,
          onPress: () => router.push('/(app)/(mobile)/(settings)/privacy-policy' as any),
        },
      ],
    },
  ];

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('settings.general.title')}
          tintColor={theme === 'dark' ? '#FFF' : '#1B1B1B'}
          leftContent={(
            <HeaderIconButton onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={theme === 'dark' ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
        />

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
          contentContainerStyle={{ paddingTop: headerOffset, paddingBottom: insets.bottom + 32 }}
        >
          {sections.map(section => (
            <View key={section.title} className="mb-6">
              <Text className="mb-2 px-4 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                {section.title}
              </Text>
              <View className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                {section.items.map((item, idx) => (
                  <View key={item.key}>
                    <TouchableOpacity
                      activeOpacity={item.onPress ? 0.7 : 1}
                      onPress={item.onPress}
                      className="flex-row items-center gap-3 px-4 py-3.5"
                    >
                      {item.icon}
                      <Text className="flex-1 text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                        {item.label}
                      </Text>
                      {item.right}
                    </TouchableOpacity>
                    {idx < section.items.length - 1 && (
                      <View className="ml-[60px] h-px bg-neutral-100 dark:bg-neutral-700" />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ─── Modals ─── */}

      <Modal ref={displayModal.ref} title={translate('settings.general.deviceViewMode')} snapPoints={[250]}>
        <View className="mx-4 overflow-hidden rounded-2xl">
          {(['grouped', 'split'] as const).map(v => (
            <OptionItem
              key={v}
              label={
                v === 'grouped'
                  ? translate('settings.general.deviceViewModeGrouped')
                  : translate('settings.general.deviceViewModeSplit')
              }
              selected={deviceViewMode === v}
              onPress={() => {
                setDeviceViewMode(v);
                displayModal.dismiss();
              }}
            />
          ))}
        </View>
      </Modal>

      <Modal ref={themeModal.ref} title={translate('settings.theme.title')} snapPoints={[300]}>
        <View className="mx-4 overflow-hidden rounded-2xl">
          {(['light', 'dark', 'system'] as const).map(v => (
            <OptionItem
              key={v}
              label={translate(`settings.theme.${v}` as TxKeyPath)}
              selected={selectedTheme === v}
              onPress={() => {
                setSelectedTheme(v);
                themeModal.dismiss();
              }}
            />
          ))}
        </View>
      </Modal>

      <Modal ref={languageModal.ref} title={translate('settings.language.title')} snapPoints={[250]}>
        <View className="mx-4 overflow-hidden rounded-2xl">
          {(['vi', 'en'] as const).map(v => (
            <OptionItem
              key={v}
              label={v === 'vi' ? translate('settings.language.vietnam') : translate('settings.language.english')}
              selected={language === v}
              onPress={() => {
                setLanguage(v as TLanguage);
                languageModal.dismiss();
              }}
            />
          ))}
        </View>
      </Modal>

      <Modal ref={tempModal.ref} title={translate('settings.general.temperatureUnit')} snapPoints={[250]}>
        <View className="mx-4 overflow-hidden rounded-2xl">
          {['°C', '°F'].map(v => (
            <OptionItem
              key={v}
              label={v}
              selected={tempLabel === v}
              onPress={() => {
                tempModal.dismiss();
              }}
            />
          ))}
        </View>
      </Modal>
    </BaseLayout>
  );
}
