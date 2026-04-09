import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
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
  title?: string;
  showBackButton?: boolean;
  filterType?: 'connection' | 'state';
  onFilterChange?: (type: 'connection' | 'state') => void;
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
  title,
  showBackButton = false,
  filterType,
  onFilterChange,
}: Props) {
  const { theme } = useUniwind();
  const router = useRouter();
  const headerHeight = useHeaderOffset();

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

        {title && (
          <View className="z-10">
            <CustomHeader
              title={title}
              style={{ backgroundColor: 'transparent' }}
              leftContent={showBackButton
                ? (
                    <HeaderIconButton onPress={() => router.canGoBack() && router.back()}>
                      <Ionicons name="chevron-back" size={28} color={theme === ETheme.Dark ? '#FFF' : '#111'} />
                    </HeaderIconButton>
                  )
                : undefined}
            />
          </View>
        )}

        <View className="flex-1">
          {onFilterChange && filterType && (
            <View className="z-20 px-4 pb-2" style={{ paddingTop: title ? headerHeight + 8 : 24 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onFilterChange('state')}
                  className={`rounded-full px-4 py-2 mr-2 ${filterType === 'state' ? 'bg-blue-500' : 'bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-md'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === 'state' ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                    {(translate('deviceDetail.timeline.filterState' as TxKeyPath) || 'Điều khiển') as string}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onFilterChange('connection')}
                  className={`rounded-full px-4 py-2 mr-2 ${filterType === 'connection' ? 'bg-blue-500' : 'bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-md'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === 'connection' ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                    {(translate('deviceDetail.timeline.filterConnection' as TxKeyPath) || 'Kết nối mạng') as string}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {isLoading && !isRefetching
            ? (
                <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              )
            : isError
              ? (
                  <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: (!onFilterChange ? headerHeight : 0) }}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text className="mt-4 text-center font-medium text-red-500">
                      {(translate('deviceDetail.timeline.errorLoadData' as TxKeyPath) || 'Lỗi tải dữ liệu. Thử lại sau.') as string}
                    </Text>
                  </View>
                )
              : sections.length === 0
                ? (
                    <View className="flex-1 items-center justify-center px-6" style={{ paddingTop: (!onFilterChange ? headerHeight : 0) }}>
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
                      contentContainerStyle={{ paddingTop: title && !onFilterChange ? headerHeight : 8, paddingBottom: 150 }}
                      showsVerticalScrollIndicator={false}
                      className="w-full flex-1"
                      onEndReached={loadMore}
                      onEndReachedThreshold={0.5}
                      ListFooterComponent={() => (
                        <View className="h-20 items-center justify-center">
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
