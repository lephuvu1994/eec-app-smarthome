import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

export function DeviceManagementScreen() {
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('settings.menu.deviceManagement' as any) || 'Device Management'}
          tintColor={theme === 'dark' ? '#FFF' : '#1B1B1B'}
          leftContent={(
            <HeaderIconButton onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={theme === 'dark' ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerOffset, paddingBottom: insets.bottom + 32 }}
        >
          <Text>{translate('base.deviceManagement')}</Text>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
