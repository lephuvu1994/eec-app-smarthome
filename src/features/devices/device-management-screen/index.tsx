import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function DeviceManagementScreen() {
  const headerHeight = useHeaderHeight();
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        {/* Background */}
        <Image
          source={
            theme === ETheme.Dark
              ? require('@@/assets/base/background-dark.png')
              : require('@@/assets/base/background-light.png')
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
          <Text>{translate('base.deviceManagement')}</Text>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
