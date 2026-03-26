import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View } from '@/components/ui';

type Props = {
  title?: string;
  message: string;
};

export function FallbackDeviceScreen({ title = 'Device', message }: Props) {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/25">
            <FontAwesome name="chevron-left" size={18} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold tracking-wide text-white">
            {title}
          </Text>
          <View className="h-11 w-11" />
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome name="info-circle" size={48} color="rgba(255,255,255,0.5)" className="mb-4" />
          <Text className="text-center text-lg text-white/70">
            {message}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
