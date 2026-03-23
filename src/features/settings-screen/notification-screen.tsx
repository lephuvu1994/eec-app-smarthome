import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function NotificationScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

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
          {/* Empty State */}
          <View className="flex-1 items-center justify-center px-8 pt-24">
            <View className="mb-4 size-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <MaterialCommunityIcons name="bell-outline" size={40} color={theme === ETheme.Dark ? '#60A5FA' : '#3B82F6'} />
            </View>
            <Text className="mb-2 text-lg font-semibold text-[#1B1B1B] dark:text-white">
              {translate('settings.notification.emptyTitle')}
            </Text>
            <Text className="text-center text-sm text-neutral-400 dark:text-neutral-300">
              {translate('settings.notification.emptyDescription')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
