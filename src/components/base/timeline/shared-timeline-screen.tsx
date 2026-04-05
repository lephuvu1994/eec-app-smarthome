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
import { EDeviceTimelineEvent, EDeviceTimelineType } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
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

  const renderIcon = (type: string, event: string, avatarUrl?: string | null) => {
    if (type === EDeviceTimelineType.Connection) {
      const isOnline = event === EDeviceTimelineEvent.Online;
      return (
        <View className={`mt-0.5 size-10 shrink-0 items-center justify-center rounded-full ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <MaterialCommunityIcons
            name={isOnline ? 'wifi' : 'wifi-off'}
            size={20}
            color={isOnline ? '#10B981' : '#EF4444'}
          />
        </View>
      );
    }
    if (avatarUrl) {
      return (
        <Image
          source={{ uri: avatarUrl }}
          className="mt-0.5 size-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
          contentFit="cover"
        />
      );
    }

    return (
      <View className="mt-0.5 size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
        <MaterialCommunityIcons name="history" size={20} color="#3B82F6" />
      </View>
    );
  };

  const renderDescription = (item: TDeviceTimelineItem) => {
    const isMain = item.entityCode === 'main';
    const deviceNameStr = item.deviceName || fallbackDeviceName;

    let finalPrefixName = '';
    if (isMain && deviceNameStr) {
      finalPrefixName = deviceNameStr; // Prefer Device Name for 'main' entity
    }
    else {
      finalPrefixName = item.entityName || deviceNameStr || '';
    }

    const namePrefix = finalPrefixName ? `[${finalPrefixName}] ` : '';

    if (item.type === EDeviceTimelineType.Connection) {
      const connEvent = item.event === EDeviceTimelineEvent.Online
        ? (translate('deviceDetail.timeline.deviceOnline' as TxKeyPath) as string)
        : (translate('deviceDetail.timeline.deviceOffline' as TxKeyPath) as string);
      return `${namePrefix}${connEvent}`;
    }

    const eventKey = `deviceDetail.timeline.events.${item.event.toLowerCase()}`;
    const transEvent = translate(eventKey as TxKeyPath);
    const i18nEvent = transEvent !== eventKey ? transEvent : item.event;

    let i18nSource = null;
    if (item.source) {
      const sourceKey = `deviceDetail.timeline.sources.${item.source.toLowerCase()}`;
      const transSource = translate(sourceKey as TxKeyPath);
      i18nSource = transSource !== sourceKey ? transSource : item.source;
    }

    const authorName = item.actionBy?.userName;

    if (i18nSource) {
      const statusText = translate('deviceDetail.timeline.statusVia' as TxKeyPath, {
        name: namePrefix,
        event: i18nEvent,
        source: i18nSource,
      }) as string;
      return authorName ? `${statusText} — ${authorName}` : statusText;
    }

    const statusText = translate('deviceDetail.timeline.statusOnly' as TxKeyPath, {
      name: namePrefix,
      event: i18nEvent,
    }) as string;
    return authorName ? `${statusText} — ${authorName}` : statusText;
  };

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
      <View className={`mx-4 flex-row items-start bg-white/70 px-5 py-4 backdrop-blur-md dark:bg-[#1C1C1E]/80 ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : 'border-b border-black/5 dark:border-white/5'}`}>
        {renderIcon(deviceItem.type, deviceItem.event, deviceItem.actionBy?.userAvatar)}
        <View className="ml-4 flex-1 justify-center">
          <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
            {renderDescription(deviceItem)}
          </Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {dayjs(deviceItem.createdAt).format('HH:mm:ss')}
          </Text>
        </View>
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
