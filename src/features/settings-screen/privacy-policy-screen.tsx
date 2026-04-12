import type { TxKeyPath } from '@/lib/i18n';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

export function PrivacyPolicyScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();

  const sections = [
    { titleKey: 'settings.privacyPolicy.section1Title', contentKey: 'settings.privacyPolicy.section1Content' },
    { titleKey: 'settings.privacyPolicy.section2Title', contentKey: 'settings.privacyPolicy.section2Content' },
    { titleKey: 'settings.privacyPolicy.section3Title', contentKey: 'settings.privacyPolicy.section3Content' },
    { titleKey: 'settings.privacyPolicy.section4Title', contentKey: 'settings.privacyPolicy.section4Content' },
    { titleKey: 'settings.privacyPolicy.section5Title', contentKey: 'settings.privacyPolicy.section5Content' },
    { titleKey: 'settings.privacyPolicy.section6Title', contentKey: 'settings.privacyPolicy.section6Content' },
  ];

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('settings.general.privacyPolicy')}
          tintColor={theme === 'dark' ? '#FFF' : '#1B1B1B'}
          leftContent={(
            <HeaderIconButton onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color={theme === 'dark' ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerOffset + 16, paddingBottom: insets.bottom + 32 }}
        >
          {/* Last updated */}
          <View className="mx-4 mb-4">
            <Text className="text-xs text-neutral-400 dark:text-neutral-500">
              {translate('settings.privacyPolicy.lastUpdated')}
            </Text>
          </View>

          {/* Intro */}
          <View className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <Text className="text-sm/6 text-neutral-600 dark:text-neutral-300">
              {translate('settings.privacyPolicy.intro')}
            </Text>
          </View>

          {/* Policy Sections */}
          {sections.map(section => (
            <View key={section.titleKey} className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
              <Text className="mb-2 text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
                {translate(section.titleKey as TxKeyPath)}
              </Text>
              <Text className="text-sm/6 text-neutral-600 dark:text-neutral-300">
                {translate(section.contentKey as TxKeyPath)}
              </Text>
            </View>
          ))}

          {/* Contact */}
          <View className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <Text className="mb-2 text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
              {translate('settings.privacyPolicy.contactTitle')}
            </Text>
            <Text className="text-sm/6 text-neutral-600 dark:text-neutral-300">
              {translate('settings.privacyPolicy.contactContent')}
            </Text>
          </View>

          {/* Footer */}
          <View className="mt-4 items-center">
            <Text className="text-xs text-neutral-400 dark:text-neutral-500">
              © 2025 vincent.le. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
