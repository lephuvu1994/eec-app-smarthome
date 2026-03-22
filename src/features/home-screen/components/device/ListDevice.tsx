import type { TDevice, TDeviceFeature } from '@/lib/api/devices/device.service';

import { useMemo } from 'react';

import { Skeleton, Text, View } from '@/components/ui';
import { GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { translate } from '@/lib/i18n';
import { getPrimaryFeatures } from '@/lib/utils/device-feature-helper';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';
import { useFavoriteStore } from '@/stores/device/favorite-store';
import { ETypeViewDevice } from '@/types/device';
import { DeviceItem } from './DeviceItem';

type TListDeviceProps = {
  roomId?: string;
  homeId: string;
  isFavorite?: boolean;
};

export function ListDevice({ roomId, isFavorite }: TListDeviceProps) {
  const storeDevices = useDeviceStore.use.devices();
  const allDevices = Array.isArray(storeDevices) ? storeDevices : [];
  const isLoading = useDeviceStore.use.isLoading();
  const favoriteIds = useFavoriteStore(s => s.favoriteIds) ?? [];
  const deviceViewMode = useConfigManager(s => s.deviceViewMode);

  // Filter devices from store
  const devices = isFavorite
    ? allDevices.filter(d => favoriteIds.includes(d.id))
    : allDevices.filter(d => d.room?.id === roomId);

  // Unpack or group them according to preferences
  const displayItems = useMemo<{ device: TDevice; feature?: TDeviceFeature }[]>(() => {
    if (deviceViewMode === 'grouped') {
      return devices.map(d => ({ device: d, feature: undefined }));
    }
    
    return devices.flatMap(device => {
      const primaries = getPrimaryFeatures(device);
      if (primaries.length <= 1) {
        return [{ device, feature: undefined }] as { device: TDevice; feature?: TDeviceFeature }[];
      }
      return primaries.map(feat => ({ device, feature: feat })) as { device: TDevice; feature?: TDeviceFeature }[];
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

  else if (devices.length === 0 && !isLoading) {
    return (
      <View className="items-center justify-center py-8">
        <Text className="text-neutral-400 dark:text-neutral-500">
          {translate('base.noDevice')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap" style={{ gap: GAP_DEVICE_VIEW_MOBILE }}>
      {displayItems.map(({ device, feature }, idx) => (
        <DeviceItem
          key={feature ? `${device.id}-${feature.id}` : device.id}
          device={device}
          activeFeature={feature}
          typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid}
        />
      ))}
    </View>
  );
}
