import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as React from 'react';
import { ActivityIndicator, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';

import { useUniwind } from 'uniwind';
import { List, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

import { TimelineItemCard } from './TimelineItemCard';
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
  /** Trigger element — wrapped in a measured container automatically. */
  trigger: React.ReactElement;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  fallbackDeviceName?: string;
  filterType?: 'connection' | 'state';
  onFilterChange?: (type: 'connection' | 'state') => void;
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
  filterType,
  onFilterChange,
}: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const [isVisible, setIsVisible] = React.useState(false);
  const triggerRef = React.useRef<any>(null);

  // Safety: only open if the native view is still mounted
  const openPopover = React.useCallback(() => {
    if (triggerRef.current) {
      setIsVisible(true);
    }
  }, []);

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={openPopover}
        activeOpacity={0.7}
      >
        {trigger}
      </TouchableOpacity>

      <Popover
        isVisible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        placement={PopoverPlacement.BOTTOM}
        from={triggerRef}
        popoverStyle={{
          borderRadius: 16,
          backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
          width: SCREEN_WIDTH * 0.75,
        }}
        onCloseComplete={() => {
          // Ensure state is clean after close animation finishes
          setIsVisible(false);
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

          {onFilterChange && filterType && (
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onFilterChange('state')}
                  className={`rounded-full px-4 py-2 mr-2 ${filterType === 'state' ? 'bg-blue-500' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === 'state' ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                    {(translate('deviceDetail.timeline.filterState' as TxKeyPath) || 'Điều khiển') as string}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onFilterChange('connection')}
                  className={`rounded-full px-4 py-2 ${filterType === 'connection' ? 'bg-blue-500' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                >
                  <Text className={`text-sm font-medium ${filterType === 'connection' ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
                    {(translate('deviceDetail.timeline.filterConnection' as TxKeyPath) || 'Kết nối mạng') as string}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

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
                  <TimelineItemCard
                    item={item}
                    isDark={isDark}
                    isLast={index === items.length - 1}
                    fallbackDeviceName={fallbackDeviceName}
                    isModal={true}
                  />
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
              onPress={() => {
                setIsVisible(false);
                setTimeout(onViewAll, 150);
              }}
              className="mt-2 items-center justify-center py-2"
            >
              <Text className="text-sm font-semibold text-blue-500">
                {(translate('deviceDetail.timeline.viewAll' as TxKeyPath) || 'Xem tất cả lịch sử') as string}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Popover>
    </>
  );
}
