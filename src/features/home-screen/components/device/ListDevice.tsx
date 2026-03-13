import { Skeleton, Text, View } from '@/components/ui';
import { GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { useDevices } from '@/hooks/use-devices';
import { translate } from '@/lib/i18n';
import { ETypeViewDevice } from '@/types/device';
import { getDeviceImage } from '../../utils/device-image';
import { DeviceItem } from './DeviceItem';

type TListDeviceProps = {
  roomId: string;
  homeId: string;
};

export function ListDevice({ roomId, homeId }: TListDeviceProps) {
  const { data, isLoading } = useDevices({ homeId, roomId });
  const devices = data?.data ?? [];

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
