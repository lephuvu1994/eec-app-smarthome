import { PrimaryHeaderHome } from '@/components/base/header/PrimaryHomeHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';

import { RoomScreenWrapper } from '../wrapper/room-screen-wrapper';

export function RoomScreen() {
  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <PrimaryHeaderHome />
        <RoomScreenWrapper className="flex-1 pt-2" />
      </View>
    </BaseLayout>
  );
}
