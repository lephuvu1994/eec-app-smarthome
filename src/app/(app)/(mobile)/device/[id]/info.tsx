import { useLocalSearchParams } from 'expo-router';
import { DeviceInfoScreen } from '@/features/devices/management/settings/device-info-screen';

export default function DeviceInfoRoute() {
  const { id } = useLocalSearchParams();
  return <DeviceInfoScreen deviceId={id as string} />;
}
