import { TDeviceTimelineItem } from '@/types/device';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as React from 'react';
import { useUniwind } from 'uniwind';

import { ActivityIndicator, List, Text, View } from '@/components/ui';
import { useDeviceTimelineInfinite } from '@/features/devices/automation/timeline/use-device-timeline';
import { useHomeTimelineInfinite } from '@/features/home-screen/hooks/use-home-timeline';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { TimelineItemCard } from './TimelineItemCard';

import 'dayjs/locale/vi';

dayjs.locale('vi');

type Props = {
  type: 'state' | 'connection';
  contextType: 'home' | 'device';
  targetId: string;
  isModal?: boolean;
  fallbackDeviceName?: string;
  emptyText?: string;
};

export function TimelineListScene({
  type,
  contextType,
  targetId,
  isModal = false,
  fallbackDeviceName,
  emptyText,
}: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const deviceTimeline = useDeviceTimelineInfinite(
    contextType === 'device' ? targetId : '',
    { type },
  );

  const homeTimeline = useHomeTimelineInfinite(
    contextType === 'home' ? targetId : '',
    { type },
  );

  const query = contextType === 'device' ? deviceTimeline : homeTimeline;

  const flattenedData = React.useMemo(() => {
    if (isModal) {
      // In modal, we just show a flat list of recent items, no headers
      return query.data?.pages.flatMap(p => p.data || p) || [];
    }

    // In full screen, we group by date and insert header objects
    const allItems = query.data?.pages.flatMap(page => page.data || page) || [];
    const grouped = allItems.reduce((acc, item) => {
      const dateStr = dayjs(item.createdAt).format('DD/MM/YYYY');
      if (!acc[dateStr])
        acc[dateStr] = [];
      acc[dateStr].push(item);
      return acc;
    }, {} as Record<string, TDeviceTimelineItem[]>);

    const dataList: any[] = [];
    Object.keys(grouped).forEach((dateStr) => {
      dataList.push({ type: 'header', title: dateStr, id: `header-${dateStr}` });
      grouped[dateStr].forEach((item, index) => {
        dataList.push({
          type: 'item',
          item,
          isFirst: index === 0,
          isLast: index === grouped[dateStr].length - 1,
        });
      });
    });

    return dataList;
  }, [query.data?.pages, isModal]);

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

  const renderFlashItem = ({ item, index }: { item: any; index: number }) => {
    if (isModal) {
      // For Popover
      return (
        <TimelineItemCard
          item={item}
          isDark={isDark}
          isLast={index === flattenedData.length - 1}
          fallbackDeviceName={fallbackDeviceName}
          isModal={true}
        />
      );
    }

    // For Full Screen
    if (item.type === 'header') {
      return (
        <View className="mx-4 mt-4 mb-2 px-1">
          <Text className="text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            {item.title}
          </Text>
        </View>
      );
    }

    const { item: deviceItem, isFirst, isLast } = item;
    return (
      <View
        className={`mx-4 bg-white/70 px-5 py-4 backdrop-blur-md dark:bg-[#1C1C1E]/80 ${
          isFirst ? 'rounded-t-2xl' : ''
        } ${isLast ? 'rounded-b-2xl' : 'border-b border-black/5 dark:border-white/5'}`}
      >
        <TimelineItemCard
          item={deviceItem}
          isDark={isDark}
          isLast={true}
          fallbackDeviceName={fallbackDeviceName}
          isModal={false}
        />
      </View>
    );
  };

  if (query.isLoading && !query.isRefetching) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size={isModal ? 'small' : 'large'} color="#3B82F6" />
      </View>
    );
  }

  if (query.isError) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <MaterialCommunityIcons name="alert-circle-outline" size={isModal ? 36 : 48} color="#EF4444" />
        <Text className="mt-4 text-center font-medium text-red-500">
          {(translate('deviceDetail.timeline.errorLoadData' as TxKeyPath) || 'Lỗi tải dữ liệu. Thử lại sau.') as string}
        </Text>
      </View>
    );
  }

  if (flattenedData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-8">
        <MaterialCommunityIcons name="clipboard-text-outline" size={isModal ? 36 : 64} color="#888" />
        <Text className="mt-4 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {emptyText || (translate('deviceDetail.timeline.noActivity' as TxKeyPath) || 'Chưa có hoạt động')}
        </Text>
      </View>
    );
  }

  return (
    <List
      data={flattenedData}
      keyExtractor={(item: any, idx: number) => {
        if (isModal)
          return item.id || `timeline-${idx}`;
        return item.type === 'header' ? item.id : (item.item.id || `timeline-${idx}`);
      }}
      renderItem={renderFlashItem}
      getItemType={(item: any) => isModal ? 'item' : item.type}
      showsVerticalScrollIndicator={false}
      className="w-full flex-1"
      contentContainerStyle={isModal ? { paddingBottom: 16 } : { paddingTop: 8, paddingBottom: 150 }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() => (
        <View className="h-16 items-center justify-center">
          {query.isFetchingNextPage && <ActivityIndicator size="small" color="#3B82F6" />}
        </View>
      )}
    />
  );
}
