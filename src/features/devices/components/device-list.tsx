import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import { useMemo } from 'react';

import { Skeleton, View } from '@/components/ui';
import { GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETypeViewDevice } from '@/types/device';
import { DeviceItem } from './device-item';
import { MOCK_DEVICES } from './mockData';

type TListDeviceProps = {
  roomId?: string;
  homeId: string;
  isFavorite?: boolean;
};

export function ListDevice({ roomId, isFavorite }: TListDeviceProps) {
  const storeDevices = useDeviceStore.use.devices();
  const allDevices = Array.isArray(storeDevices) ? storeDevices : [];
  const isLoading = useDeviceStore.use.isLoading();
  // const favoriteIds = useFavoriteStore(s => s.favoriteIds) ?? [];
  const deviceViewMode = useConfigManager(s => s.deviceViewMode);

  // Filter devices from store
  const realDevices = isFavorite
    ? allDevices
    : allDevices.filter(d => d.room?.id === roomId);

  // TODO: Remove mock devices after App Store approval
  // Merge mock devices when no real devices exist
  const devices = realDevices.length > 0 ? realDevices : MOCK_DEVICES;

  // Unpack or group them according to preferences
  const displayItems = useMemo<{ device: TDevice; entity?: TDeviceEntity }[]>(() => {
    if (deviceViewMode === 'grouped') {
      return devices.map(d => ({ device: d, entity: undefined }));
    }

    return devices.flatMap((device) => {
      const primaries = getPrimaryEntities(device);
      if (primaries.length <= 1) {
        return [{ device, entity: undefined }] as { device: TDevice; entity?: TDeviceEntity }[];
      }
      return primaries.map(entity => ({ device, entity })) as { device: TDevice; entity?: TDeviceEntity }[];
    });
  }, [devices, deviceViewMode]);

  if (isLoading) {
    return (
      <View className="flex-row flex-wrap" style={{ gap: GAP_DEVICE_VIEW_MOBILE }}>
        <Skeleton width="100%" height={80} borderRadius={16} />
        <Skeleton width="48%" height={80} borderRadius={16} />
        <Skeleton width="48%" height={80} borderRadius={16} />
        <Skeleton width="100%" height={80} borderRadius={16} />
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap" style={{ gap: GAP_DEVICE_VIEW_MOBILE }}>
      {displayItems.map(({ device, entity }, idx) => (
        <DeviceItem
          key={entity ? `${device.id}-${entity.id}` : device.id}
          device={device}
          activeEntity={entity}
          typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.HalfWidth}
        />
      ))}
    </View>
  );
}
