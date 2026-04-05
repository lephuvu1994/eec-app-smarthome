import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';
import * as React from 'react';
import { useLayoutEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { IS_IOS, showErrorMessage, Text, View } from '@/components/ui';
import { BellIcon } from '@/components/ui/icons';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { TimelinePopover } from '@/features/devices/automation/timeline/timeline-popover';
import { DeviceActionBar } from '@/features/devices/common/components/device-action-bar';
import { RenameDeviceModal } from '@/features/devices/common/modals/rename-device-modal';
import { SwitchModalItem } from '@/features/devices/types/switch/components/switch-modal-item';
import { deviceService, EDeviceStatus } from '@/lib/api/devices/device.service';

import { translate } from '@/lib/i18n';
import { isPrimaryEntity } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function SwitchDetailScreen({ deviceId, entityId }: Props) {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const isDark = theme === ETheme.Dark;
  const [renameTargetEntity, setRenameTargetEntity] = React.useState<string | null>(null);

  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;

  const primaryEntities = device ? (device.entities ?? []).filter(isPrimaryEntity) : [];
  const activeEntity = entityId ? primaryEntities.find(e => e.id === entityId || e.code === entityId) : undefined;
  const displayedEntities = activeEntity ? [activeEntity] : primaryEntities;

  const headerTitle = activeEntity
    ? (activeEntity.name || activeEntity.code)
    : (device?.name ?? '');

  const isOnline = device?.status === EDeviceStatus.ONLINE;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Animated.View entering={FadeInDown.duration(300)} className="items-center">
          <Text className="text-lg font-semibold text-[#1B1B1B] dark:text-white" numberOfLines={1}>
            {headerTitle}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <View className={`size-2 rounded-full ${isOnline ? 'bg-[#A3E635]' : 'bg-red-500'}`} />
            <Text className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              {isOnline ? translate('base.online') : translate('base.offline')}
            </Text>
          </View>
        </Animated.View>
      ),
      headerRight: () => (
        <Animated.View entering={FadeInRight.duration(300)} className="flex-row items-center gap-2">
          <TimelinePopover
            deviceId={deviceId}
            fromRect={{
              x: Dimensions.get('window').width - (BASE_SPACE_HORIZONTAL + 40), // 16 padding right + 40 icon width
              y: IS_IOS ? insets.top + 5 : insets.top + 15,
              width: 40,
              height: 40,
            }}
            renderTrigger={(sourceRef, openPopover) => (
              <TouchableOpacity
                ref={sourceRef}
                onPress={openPopover}
                activeOpacity={0.7}
                className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
              >
                <BellIcon color={isDark ? '#FFF' : '#1B1B1B'} />
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      ),
    });
  }, [isDark, headerTitle, isOnline, deviceId, navigation, insets.top]);

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-900">
        <Text className="text-white">{translate('base.somethingWentWrong')}</Text>
      </View>
    );
  }

  return (
    <BaseLayout>
      <View className="relative w-full flex-1 bg-[#F5F7FA] dark:bg-[#1B1B1B]" style={{ paddingTop: headerHeight, paddingBottom: insets.bottom }}>
        {isDark && (
          <Image
            source={require('@@/assets/base/background-dark.webp')}
            style={[
              {
                width: '100%',
                height: '100%',
                position: 'absolute',
              },
              StyleSheet.absoluteFillObject,
            ]}
            contentFit="cover"
          />
        )}

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-6 px-2 text-2xl font-bold text-[#1B1B1B] dark:text-white">
            {translate('base.device')}
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4 px-2">
            {displayedEntities.map(entity => (
              <SwitchModalItem
                key={entity.id}
                device={device}
                entity={entity}
                onLongPress={() => setRenameTargetEntity(entity.code)}
              />
            ))}
          </View>
        </ScrollView>

        <RenameDeviceModal
          isVisible={!!renameTargetEntity}
          onClose={() => setRenameTargetEntity(null)}
          currentName={primaryEntities.find(e => e.code === renameTargetEntity)?.name || renameTargetEntity || ''}
          onSave={async (newName) => {
            if (!renameTargetEntity) {
              return;
            }
            try {
              await deviceService.renameDeviceEntity(deviceId, renameTargetEntity, newName);
              useDeviceStore.getState().updateDeviceEntity(deviceId, renameTargetEntity, { name: newName });
            }
            catch (error) {
              console.error('Failed to rename entity:', error);
              showErrorMessage(translate('base.somethingWentWrong') || 'Đổi tên thất bại');
            }
          }}
        />

        <DeviceActionBar device={device} entities={displayedEntities} />
      </View>
    </BaseLayout>
  );
}
