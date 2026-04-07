import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { useUniwind } from 'uniwind';
import { List, Text, TouchableOpacity, View } from '@/components/ui';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

import { TimelineItemCard } from './TimelineItemCard';
import 'dayjs/locale/vi';

dayjs.locale('vi');

type Props = {
  items: TDeviceTimelineItem[];
  isLoading: boolean;
  isError: boolean;
  title: string;
  emptyText: string;
  onViewAll: () => void;
  trigger: React.ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  fallbackDeviceName?: string;
};

export function SharedTimelinePopover({
  items,
  isLoading,
  isError,
  title,
  emptyText,
  onViewAll,
  trigger,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  fallbackDeviceName,
}: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-[85vw] max-w-[400px]">
        <View>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-bold text-neutral-900 dark:text-white">
              {title}
            </Text>
            <PopoverClose asChild>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={isDark ? '#FFF' : '#111'}
                />
              </TouchableOpacity>
            </PopoverClose>
          </View>

          {/* Body */}
          <View
            style={
              items.length > 0
                ? { height: 350, width: '100%' }
                : { minHeight: 100, width: '100%' }
            }
          >
            {/* Loading */}
            {isLoading && items.length === 0 && (
              <View className="py-4">
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}

            {/* Error */}
            {isError && (
              <Text className="py-4 text-center text-sm text-red-500">
                {(translate('deviceDetail.timeline.errorLoadData' as TxKeyPath)
                  || 'Lỗi tải dữ liệu. Thử lại sau.') as string}
              </Text>
            )}

            {/* Empty */}
            {!isLoading && !isError && items.length === 0 && (
              <View className="items-center justify-center py-6">
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={36}
                  color="#555"
                />
                <Text className="mt-3 text-sm text-neutral-400">
                  {emptyText}
                </Text>
              </View>
            )}

            {/* List */}
            {!isLoading && !isError && items.length > 0 && (
              <List
                data={items}
                keyExtractor={(item: any, idx: number) =>
                  item?.id || `timeline-${idx}`}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    onLoadMore?.();
                  }
                }}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                renderItem={({
                  item,
                  index,
                }: {
                  item: TDeviceTimelineItem;
                  index: number;
                }) => (
                  <TimelineItemCard
                    item={item}
                    isDark={isDark}
                    isLast={index === items.length - 1}
                    fallbackDeviceName={fallbackDeviceName}
                    isModal
                  />
                )}
                ListFooterComponent={() => (
                  <View className="h-10 items-center justify-center">
                    {isFetchingNextPage && (
                      <ActivityIndicator size="small" color="#3B82F6" />
                    )}
                  </View>
                )}
              />
            )}
          </View>

          {!isLoading && !isError && items.length > 0 && (
            <PopoverClose asChild>
              <TouchableOpacity
                onPress={onViewAll}
                className="mt-2 items-center justify-center py-2"
              >
                <Text className="text-sm font-semibold text-blue-500">
                  {(translate('deviceDetail.timeline.viewAll' as TxKeyPath)
                    || 'Xem tất cả lịch sử') as string}
                </Text>
              </TouchableOpacity>
            </PopoverClose>
          )}
        </View>
      </PopoverContent>
    </Popover>
  );
}
