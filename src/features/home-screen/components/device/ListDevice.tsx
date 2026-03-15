import { Skeleton, Text, View } from '@/components/ui';
import { GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';
import { useFavoriteStore } from '@/stores/device/favorite-store';
import { ETypeViewDevice } from '@/types/device';
import { getDeviceImage } from '../../utils/device-image';
import { DeviceItem } from './DeviceItem';

type TListDeviceProps = {
  roomId?: string;
  homeId: string;
  isFavorite?: boolean;
};

export function ListDevice({ roomId, isFavorite }: TListDeviceProps) {
  const allDevices = useDeviceStore(s => s.devices);
  const isLoading = useDeviceStore(s => s.isLoading);
  const favoriteIds = useFavoriteStore(s => s.favoriteIds);

  // Filter devices from store
  const devices = isFavorite
    ? allDevices.filter(d => favoriteIds.includes(d.id))
    : allDevices.filter(d => d.room?.id === roomId);

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

  if (devices.length === 0) {
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
      {devices.map((device, idx) => {
        // Map API TDevice to UI TDevice shape
        const uiDevice = {
          id: device.id,
          name: device.name,
          type: device.features?.[0]?.category ?? 'camera',
          status: device.status === 'online' ? 'CONNECTED' as const : 'DISCONNECTED' as const,
          image: getDeviceImage(device.features?.[0]?.category ?? 'camera'),
        };

        return (
          <DeviceItem
            key={device.id}
            device={uiDevice as any}
            typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid}
          />
        );
      })}
    </View>
  );
}
