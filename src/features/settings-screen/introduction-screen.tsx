import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function IntroductionScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const appVersion = Constants.expoConfig?.version ?? '0.0.1';

  const features = [
    { icon: 'lightbulb-outline' as const, textKey: 'settings.introduction.feature1' as const },
    { icon: 'robot-outline' as const, textKey: 'settings.introduction.feature2' as const },
    { icon: 'shield-check-outline' as const, textKey: 'settings.introduction.feature3' as const },
    { icon: 'chart-line' as const, textKey: 'settings.introduction.feature4' as const },
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
          {/* App Logo & Name */}
          <View className="mb-6 items-center px-4">
            <View className="mb-4 size-24 items-center justify-center overflow-hidden rounded-[28px] bg-white shadow-md dark:bg-neutral-800">
              <Image
                source={require('@@/assets/logo.png')}
                style={{ width: 80, height: 80 }}
                contentFit="contain"
              />
            </View>
            <Text className="text-2xl font-bold text-[#1B1B1B] dark:text-white">Sensa Smart</Text>
            <Text className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
              {translate('settings.introduction.tagline')}
            </Text>
          </View>

          {/* Description */}
          <View className="mx-4 mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <Text className="text-sm/6 text-neutral-600 dark:text-neutral-300">
              {translate('settings.introduction.description')}
            </Text>
          </View>

          {/* Features */}
          <View className="mx-4 mb-6">
            <Text className="mb-2 px-0 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              {translate('settings.introduction.featuresTitle')}
            </Text>
            <View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
              {features.map((feature, idx) => (
                <View key={feature.textKey}>
                  <View className="flex-row items-center gap-3 px-4 py-3.5">
                    <View className="size-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <MaterialCommunityIcons name={feature.icon} size={20} color="#059669" />
                    </View>
                    <Text className="flex-1 text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                      {translate(feature.textKey)}
                    </Text>
                  </View>
                  {idx < features.length - 1 && (
                    <View className="ml-[60px] h-px bg-neutral-100 dark:bg-neutral-700" />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Contact */}
          <View className="mx-4 mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800">
            <Text className="mb-1 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              {translate('settings.introduction.contactTitle')}
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300">
              Email: vulewenlian94@gmail.com
            </Text>
          </View>

          {/* Version */}
          <View className="items-center">
            <Text className="text-xs text-neutral-400 dark:text-neutral-500">
              Sensa Smart v{appVersion}
            </Text>
            <Text className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
              © 2025 vincent.le. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
