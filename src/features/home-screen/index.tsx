import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';
import { HomeScreenWrapper } from './wrapper/home-screen-wrapper';

export function HomeScreen() {
  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <PrimaryHeaderHome />
        <HomeScreenWrapper className="flex-1 pt-2" />
      </View>
    </BaseLayout>
  );
}
