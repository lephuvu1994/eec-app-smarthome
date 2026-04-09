import { useLocalSearchParams } from 'expo-router';
import { CreateShareScreen } from '@/features/devices/share/create-share-screen';

export default function CreateShareRoute() {
  const { id } = useLocalSearchParams();
  return <CreateShareScreen deviceId={id as string} />;
}
