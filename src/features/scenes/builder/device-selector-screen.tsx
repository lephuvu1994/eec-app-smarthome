import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomHeader, HeaderBackButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, View } from '@/components/ui';
import { useSceneBuilderStore } from '@/features/scenes/builder/stores/scene-builder-store';
import { useDevices } from '@/hooks/use-devices';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';
import { ESceneActionType } from '@/types/scene';

export function DeviceSelectorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const homeId = useHomeStore.use.selectedHomeId();
  const { data: devicesData } = useDevices({ homeId: homeId || undefined });
  const heightOffset = useHeaderOffset();

  const addAction = useSceneBuilderStore(state => state.addAction);

  const handleSelectDevice = useCallback((deviceToken: string, deviceName: string) => {
    // Tạm thời mock thêm thẳng action, Phase 4 sẽ mở config bottom sheet
    addAction({
      type: ESceneActionType.DeviceControl,
      deviceToken,
      deviceName,
      entityCode: 'switch_1',
      value: true,
    });
    router.back();
  }, [addAction, router]);

  return (
    <BaseLayout>
      <CustomHeader
        title={translate('scenes.builder.selectDevice')}
        leftContent={<HeaderBackButton onPress={() => router.back()} />}
      />
      <FlatList
        data={devicesData?.data || []}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20, paddingTop: heightOffset + 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-charcoal-900"
            onPress={() => handleSelectDevice(item.token, item.name)}
            activeOpacity={0.7}
          >
            <View>
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {item.name}
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {item.room?.name || translate('scenes.builder.noRoomAssigned')}
              </Text>
            </View>
            <Text className="text-primary text-sm font-medium">{translate('scenes.builder.add')}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="mt-10 items-center justify-center">
            <Text className="text-gray-500">{translate('scenes.builder.noDevicesInArea')}</Text>
          </View>
        )}
      />
    </BaseLayout>
  );
}
