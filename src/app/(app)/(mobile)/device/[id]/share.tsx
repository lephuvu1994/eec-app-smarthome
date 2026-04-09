import { useLocalSearchParams } from 'expo-router';
import { DeviceShareScreen } from '@/features/devices/share/device-share-screen';

export default function ShareDeviceRoute() {
  const { id } = useLocalSearchParams();
  return <DeviceShareScreen deviceId={id as string} />;
}
