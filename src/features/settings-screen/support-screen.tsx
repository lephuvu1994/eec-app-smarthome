import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type SupportItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export function SupportScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const supportItems: SupportItem[] = [
    {
      key: 'faq',
      label: translate('settings.support.faq'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <MaterialCommunityIcons name="frequently-asked-questions" size={20} color="#3B82F6" />
        </View>
      ),
      onPress: () => {},
    },
    {
      key: 'contact',
      label: translate('settings.support.contactUs'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
          <MaterialCommunityIcons name="email-outline" size={20} color="#059669" />
        </View>
      ),
      onPress: () => Linking.openURL('mailto:vulewenlian94@gmail.com'),
    },
    {
      key: 'userGuide',
      label: translate('settings.support.userGuide'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
          <MaterialCommunityIcons name="book-open-outline" size={20} color="#7C3AED" />
        </View>
      ),
      onPress: () => {},
    },
    {
      key: 'feedback',
      label: translate('settings.support.feedback'),
      icon: (
        <View className="size-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
          <MaterialCommunityIcons name="message-text-outline" size={20} color="#F59E0B" />
        </View>
      ),
      onPress: () => {},
    },
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
          {/* Support Items */}
          <View className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            {supportItems.map((item, idx) => (
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
                {idx < supportItems.length - 1 && (
                  <View className="ml-[60px] h-px bg-neutral-100 dark:bg-neutral-700" />
                )}
              </View>
            ))}
          </View>

          {/* App Version */}
          <View className="mt-8 items-center">
            <Text className="text-xs text-neutral-400 dark:text-neutral-500">
              Sensa Smart v0.0.1
            </Text>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
