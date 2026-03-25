import type { TRoom } from '@/lib/api/homes/home.service';
import { FlashList } from '@shopify/flash-list';
import { memo } from 'react';

import { View, WIDTH } from '@/components/ui';
import { RoomCard } from './room-card';

type TRoomListPageProps = {
  rooms: TRoom[];
  isGrid: boolean;
};

export const RoomListPage = memo(({ rooms, isGrid }: TRoomListPageProps) => {
  return (
    <View style={{ width: WIDTH }} className="flex-1">
      <FlashList
        data={rooms}
        key={isGrid ? 'grid' : 'list'}
        numColumns={isGrid ? 2 : 1}
        // @ts-expect-error - The local type definitions for FlashList are missing this
        estimatedItemSize={isGrid ? WIDTH / 2 : 140}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <RoomCard room={item} idx={index} isGrid={isGrid} />
        )}
      />
    </View>
  );
});
