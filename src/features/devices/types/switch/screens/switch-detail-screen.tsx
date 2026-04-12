import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import * as React from 'react';

import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, showErrorMessage, Text, View } from '@/components/ui';
import { BellIcon } from '@/components/ui/icons';
import { TimelinePopover } from '@/features/devices/automation/timeline/timeline-popover';
import { DeviceActionBar } from '@/features/devices/common/components/device-action-bar';
import { NetworkSignalIndicator } from '@/features/devices/common/components/network-signal-indicator';
import { RenameDeviceModal } from '@/features/devices/common/modals/rename-device-modal';
import { SwitchModalItem } from '@/features/devices/types/switch/components/switch-modal-item';

import { deviceService } from '@/lib/api/devices/device.service';
import { EDeviceStatus } from '@/types/device';
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
  const router = useRouter();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
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
  const iconColor = isDark ? '#FFF' : '#1B1B1B';

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-900">
        <Text className="text-white">{translate('base.somethingWentWrong')}</Text>
      </View>
    );
  }

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          titleComponent={(
            <View className="items-center">
              <Text className="text-lg font-semibold text-[#1B1B1B] dark:text-white" numberOfLines={1}>
                {headerTitle}
              </Text>
              <View className="mt-1 flex-row items-center gap-1.5">
                {device?.protocol
                  ? (
                      <NetworkSignalIndicator
                        protocol={device.protocol}
                        isOnline={isOnline}
                        rssi={device.rssi}
                        linkquality={device.linkquality}
                        size={14}
                      />
                    )
                  : (
                      <View className={`size-2 rounded-full ${isOnline ? 'bg-[#A3E635]' : 'bg-red-500'}`} />
                    )}
                <Text className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {isOnline ? translate('base.online') : translate('base.offline')}
                </Text>
              </View>
            </View>
          )}
          leftContent={(
            <HeaderIconButton onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={iconColor} />
            </HeaderIconButton>
          )}
          rightContent={(
            <View className="flex-row items-center gap-2">
              <TimelinePopover
                deviceId={deviceId}
                trigger={(
                  <View className="size-10 items-center justify-center rounded-full bg-white/10">
                    <BellIcon color={iconColor} />
                  </View>
                )}
              />
              <HeaderIconButton onPress={() => router.push({ pathname: '/device/[id]/settings', params: { id: deviceId } })}>
                <MaterialCommunityIcons name="cog-outline" size={24} color={iconColor} />
              </HeaderIconButton>
            </View>
          )}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: headerOffset + 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-4 px-2 text-[28px] font-bold text-black dark:text-white">
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
