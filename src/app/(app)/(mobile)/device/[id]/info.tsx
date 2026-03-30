import { useLocalSearchParams } from 'expo-router';
import { DeviceInfoScreen } from '@/features/devices/screens/device-info-screen';

export default function DeviceInfoRoute() {
  const { id } = useLocalSearchParams();
  return <DeviceInfoScreen deviceId={id as string} />;
}
