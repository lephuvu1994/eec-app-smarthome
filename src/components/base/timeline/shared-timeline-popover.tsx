import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as React from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';

import { useUniwind } from 'uniwind';
import { List, Text, View } from '@/components/ui';
import { EDeviceTimelineEvent, EDeviceTimelineType } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';

import { ETheme } from '@/types/base';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  items: TDeviceTimelineItem[];
  isLoading: boolean;
  isError: boolean;
  title: string;
  emptyText: string;
  onViewAll: () => void;
  renderTrigger: (sourceRef: React.RefObject<any>, openPopover: () => void) => React.ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
};

export function SharedTimelinePopover({
  items,
  isLoading,
  isError,
  title,
  emptyText,
  onViewAll,
  renderTrigger,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const [isVisible, setIsVisible] = React.useState(false);

  const handleViewAll = () => {
    setIsVisible(false);
    setTimeout(() => {
      onViewAll();
    }, 150);
  };

  const renderIcon = (type: string, event: string) => {
    if (type === EDeviceTimelineType.Connection) {
      const isOnline = event === EDeviceTimelineEvent.Online;
      return (
        <View className={`size-8 shrink-0 items-center justify-center rounded-full ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <MaterialCommunityIcons
            name={isOnline ? 'wifi' : 'wifi-off'}
            size={16}
            color={isOnline ? '#10B981' : '#EF4444'}
          />
        </View>
      );
    }
    return (
      <View className="size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
        <MaterialCommunityIcons name="history" size={16} color="#3B82F6" />
      </View>
    );
  };

  const renderDescription = (item: TDeviceTimelineItem) => {
    const namePrefix = item.deviceName ? `[${item.deviceName}] ` : (item.entityName ? `[${item.entityName}] ` : '');

    if (item.type === EDeviceTimelineType.Connection) {
      const connEvent = item.event === EDeviceTimelineEvent.Online
        ? (translate('deviceDetail.timeline.deviceOnline' as TxKeyPath) as string)
        : (translate('deviceDetail.timeline.deviceOffline' as TxKeyPath) as string);
      return `${namePrefix}${connEvent}`;
    }

    // Translation fallback mapping
    const eventKey = `deviceDetail.timeline.events.${item.event.toLowerCase()}`;
    const transEvent = translate(eventKey as TxKeyPath);
    const i18nEvent = transEvent !== eventKey ? transEvent : item.event;

    let i18nSource = null;
    if (item.source) {
      const sourceKey = `deviceDetail.timeline.sources.${item.source.toLowerCase()}`;
      const transSource = translate(sourceKey as TxKeyPath);
      i18nSource = transSource !== sourceKey ? transSource : item.source;
    }

    if (i18nSource) {
      return (translate('deviceDetail.timeline.statusVia' as TxKeyPath, {
        name: namePrefix,
        event: i18nEvent,
        source: i18nSource,
      }) as string);
    }

    return (translate('deviceDetail.timeline.statusOnly' as TxKeyPath, {
      name: namePrefix,
      event: i18nEvent,
    }) as string);
  };

  return (
    <Popover
      isVisible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      placement={PopoverPlacement.BOTTOM}
      from={sourceRef => renderTrigger(sourceRef, () => setIsVisible(true))}
      popoverStyle={{
        borderRadius: 16,
        backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
        width: SCREEN_WIDTH * 0.75,
      }}
    >
      <View className="w-full rounded-2xl p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-bold text-neutral-900 dark:text-white">
            {title}
          </Text>
          <TouchableOpacity onPress={() => setIsVisible(false)}>
            <MaterialCommunityIcons name="close" size={20} color={isDark ? '#FFF' : '#111'} />
          </TouchableOpacity>
        </View>

        <View className={items.length > 0 ? 'h-[350px] max-h-[60vh] w-full' : 'min-h-[100px] w-full'}>
          {isLoading && items.length === 0 && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          )}

          {isError && (
            <Text className="py-4 text-center text-sm text-red-500">
              {(translate('deviceDetail.timeline.errorLoadData' as TxKeyPath) || 'Lỗi tải dữ liệu. Thử lại sau.') as string}
            </Text>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <View className="items-center justify-center py-6">
              <MaterialCommunityIcons name="clipboard-text-outline" size={36} color="#555" />
              <Text className="mt-3 text-sm text-neutral-400">
                {emptyText}
              </Text>
            </View>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <List
              data={items}
              keyExtractor={(item: any, idx: number) => item?.id || `timeline-${idx}`}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  onLoadMore?.();
                }
              }}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }: { item: TDeviceTimelineItem; index: number }) => (
                <View className="mb-3 flex-row items-start gap-3">
                  {renderIcon(item.type, item.event)}
                  <View className={`flex-1 shrink ${index !== items.length - 1 ? 'border-b border-black/5 pb-3 dark:border-neutral-800' : ''}`}>
                    <Text className="text-sm/5 font-medium text-neutral-800 dark:text-neutral-200">
                      {renderDescription(item)}
                    </Text>
                    <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                      {dayjs(item.createdAt).format('HH:mm:ss')}
                    </Text>
                  </View>
                </View>
              )}
              ListFooterComponent={() => (
                <View className="h-10 items-center justify-center">
                  {isFetchingNextPage && <ActivityIndicator size="small" color="#3B82F6" />}
                </View>
              )}
            />
          )}
        </View>

        {!isLoading && !isError && items.length > 0 && (
          <TouchableOpacity
            onPress={handleViewAll}
            className="mt-2 items-center justify-center py-2"
          >
            <Text className="text-sm font-semibold text-blue-500">
              {(translate('deviceDetail.timeline.viewAll' as TxKeyPath) || 'Xem tất cả lịch sử') as string}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Popover>
  );
}
