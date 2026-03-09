import type { TDevice } from '@/types/device';
import { View } from 'react-native';
import { GAP_DEVICE_VIEW_MOBILE } from '@/constants';
import { ETypeViewDevice } from '@/types/device';
import { DeviceItem } from './DeviceItem';
import { listDevice } from './mockData';

export function ListDevice() {
  return (
    <View className="flex-row flex-wrap" style={{ gap: GAP_DEVICE_VIEW_MOBILE }}>
      {listDevice.map((device: TDevice, idx: number) => {
        if (device.type === 'camera') {
          return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />;
        }
        else if (device.type === 'light') {
          return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />;
        }
        else if (device.type === 'alexa') {
          return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />;
        }
        return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />;
      })}
    </View>
  );
}
