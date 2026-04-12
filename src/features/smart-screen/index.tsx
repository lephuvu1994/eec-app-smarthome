import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';
import { SmartScreenWrapper } from './wrapper/smart-screen-wrapper';

export function SmartScreen() {
  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <PrimaryHeaderHome />
        <SmartScreenWrapper className="pt-4" />
      </View>
    </BaseLayout>
  );
}
