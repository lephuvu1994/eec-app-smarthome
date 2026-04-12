import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function MessageCenterScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('settings.menu.messageCenter')}
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
          {/* Empty State */}
          <View className="flex-1 items-center justify-center px-8 pt-24">
            <View className="mb-4 size-20 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
              <MaterialCommunityIcons name="message-outline" size={40} color={theme === ETheme.Dark ? '#FBBF24' : '#F59E0B'} />
            </View>
            <Text className="mb-2 text-lg font-semibold text-[#1B1B1B] dark:text-white">
              {translate('settings.messageCenter.emptyTitle')}
            </Text>
            <Text className="text-center text-sm text-neutral-400 dark:text-neutral-300">
              {translate('settings.messageCenter.emptyDescription')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
