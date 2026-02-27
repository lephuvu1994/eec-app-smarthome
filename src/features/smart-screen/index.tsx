import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, View } from '@/components/ui';

export function SmartScreen() {
  return (
    <BaseLayout>
      <View className="flex-1 px-4 pb-2">
        <Text className="text-2xl font-bold">SmartScreen</Text>
      </View>
    </BaseLayout>
  );
}
