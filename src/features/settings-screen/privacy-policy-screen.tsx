import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function PrivacyPolicyScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

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
          contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: insets.bottom + 32 }}
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
          {sections.map((section) => (
            <View key={section.titleKey} className="mx-4 mb-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
              <Text className="mb-2 text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
                {translate(section.titleKey as any)}
              </Text>
              <Text className="text-sm/6 text-neutral-600 dark:text-neutral-300">
                {translate(section.contentKey as any)}
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
