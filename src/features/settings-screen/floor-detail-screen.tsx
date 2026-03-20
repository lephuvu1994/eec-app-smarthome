import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text, TouchableOpacity, View } from '@/components/ui';
import { useDeleteFloor, useFloors, useUpdateFloor } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

export function FloorDetailScreen() {
  const { floorId, floorName } = useLocalSearchParams<{ floorId: string; floorName: string }>();
  const headerHeight = useHeaderHeight();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const insets = useSafeAreaInsets();
  const homeId = useHomeStore(s => s.selectedHomeId) ?? '';

  const { data: floors } = useFloors(homeId);
  const floor = floors?.find(f => f.id === floorId);

  const [name, setName] = useState(floorName ?? '');
  const updateFloor = useUpdateFloor(homeId);
  const deleteFloor = useDeleteFloor(homeId);

  const handleSave = useCallback(() => {
    if (!floorId || !name.trim())
      return;
    updateFloor.mutate({ floorId, body: { name: name.trim() } });
  }, [floorId, name, updateFloor]);

  const handleDelete = useCallback(() => {
    if (!floorId)
      return;
    Alert.alert(
      translate('roomManagement.deleteFloor'),
      translate('roomManagement.confirmDeleteFloor'),
      [
        { text: translate('base.cancel'), style: 'cancel' },
        {
          text: translate('base.deleteButton'),
          style: 'destructive',
          onPress: () => {
            deleteFloor.mutate(floorId, {
              onSuccess: () => router.back(),
            });
          },
        },
      ],
    );
  }, [floorId, deleteFloor]);

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={
            isDark
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
          contentContainerStyle={{ paddingTop: headerHeight + 8, paddingBottom: insets.bottom + 32 }}
        >
          {/* ─── Floor name ─── */}
          <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <View className="px-4 py-3">
              <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {translate('roomManagement.floorName')}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={translate('roomManagement.floorNamePlaceholder')}
                placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-[#1B1B1B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </View>
          </View>

          {/* ─── Room count ─── */}
          <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <View className="flex-row items-center justify-between px-4 py-3.5">
              <View className="flex-row items-center gap-3">
                <View className="size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <MaterialCommunityIcons name="door-open" size={18} color="#3B82F6" />
                </View>
                <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">
                  {translate('roomManagement.roomsCount', { count: floor?.rooms?.length ?? 0 })}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Save button ─── */}
          <View className="mx-4 mb-4">
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim() || updateFloor.isPending}
              activeOpacity={0.8}
              className="items-center rounded-xl bg-emerald-500 py-3.5 disabled:opacity-50"
            >
              <Text className="text-[15px] font-semibold text-white">
                {translate('base.saveButton')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── Delete ─── */}
          <View className="mx-4">
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteFloor.isPending}
              activeOpacity={0.7}
              className="items-center rounded-xl bg-red-500 py-3.5 disabled:opacity-50"
            >
              <Text className="text-[15px] font-semibold text-white">
                {translate('roomManagement.deleteFloor')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
