import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useUniwind } from 'uniwind';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { ActivityIndicator, List, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { TimelineItemCard } from './TimelineItemCard';
import 'dayjs/locale/vi';

dayjs.locale('vi');
type Props = {
  sections: { title: string; data: TDeviceTimelineItem[] }[];
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  emptyText: string;
  onLoadMore: () => void;
  fallbackDeviceName?: string;
};

export function SharedTimelineScreen({
  sections,
  isLoading,
  isRefetching,
  isError,
  isFetchingNextPage,
  hasNextPage,
  emptyText,
  onLoadMore,
  fallbackDeviceName,
}: Props) {
  const { theme } = useUniwind();
  const headerHeight = useHeaderHeight();

  const flattenedData = React.useMemo(() => {
    const data: any[] = [];
    sections.forEach((section) => {
      data.push({ type: 'header', title: section.title, id: `header-${section.title}` });
      section.data.forEach((item, index) => {
        data.push({
          type: 'item',
          item,
          isFirst: index === 0,
          isLast: index === section.data.length - 1,
        });
      });
    });
    return data;
  }, [sections]);

  const renderFlashItem = ({ item }: { item: any }) => {
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
      <View className={`mx-4 bg-white/70 px-5 py-4 backdrop-blur-md dark:bg-[#1C1C1E]/80 ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : 'border-b border-black/5 dark:border-white/5'}`}>
        <TimelineItemCard
          item={deviceItem}
          isDark={theme === ETheme.Dark}
          isLast={true}
          fallbackDeviceName={fallbackDeviceName}
          isModal={false}
        />
      </View>
    );
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  };

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={theme === ETheme.Dark ? require('@@/assets/base/background-dark.webp') : require('@@/assets/base/background-light.webp')}
          style={[{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }, StyleSheet.absoluteFillObject]}
          contentFit="cover"
        />
        <View className="flex-1">
          {isLoading && !isRefetching
            ? (
                <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              )
            : isError
              ? (
                  <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: headerHeight }}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text className="mt-4 text-center font-medium text-red-500">
                      {(translate('deviceDetail.timeline.errorLoadData' as TxKeyPath) || 'Lỗi tải dữ liệu. Thử lại sau.') as string}
                    </Text>
                  </View>
                )
              : sections.length === 0
                ? (
                    <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: headerHeight }}>
                      <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#888" />
                      <Text className="mt-4 text-center font-medium text-neutral-500 dark:text-neutral-400">
                        {emptyText}
                      </Text>
                    </View>
                  )
                : (
                    <List
                      data={flattenedData}
                      keyExtractor={(item: any, index: number) => item.type === 'header' ? item.id : (item.item.id || `timeline-${index}`)}
                      renderItem={renderFlashItem}
                      getItemType={(item: any) => item.type}
                      contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 100 }}
                      showsVerticalScrollIndicator={false}
                      className="w-full flex-1"
                      onEndReached={loadMore}
                      onEndReachedThreshold={0.5}
                      ListFooterComponent={() => (
                        <View className="h-16 items-center justify-center">
                          {isFetchingNextPage && <ActivityIndicator size="small" color="#888" />}
                        </View>
                      )}
                    />
                  )}
        </View>
      </View>
    </BaseLayout>
  );
}
