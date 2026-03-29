import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';

import * as React from 'react';
import { ActivityIndicator, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/ui';
import { useDeviceTimelineInfinite } from '@/features/devices/hooks/use-device-timeline';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';
import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function DeviceTimelineScreen() {
  const { id: deviceId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;

  const {
    data,
    isLoading,
    isRefetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDeviceTimelineInfinite(deviceId as string);

  // Flatten and group the data
  const flattenedData = data?.pages.flatMap(page => page.data) || [];

  const sections = React.useMemo(() => {
    const grouped = flattenedData.reduce((acc, item) => {
      const dateStr = dayjs(item.createdAt).format('DD/MM/YYYY');
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(item);
      return acc;
    }, {} as Record<string, TDeviceTimelineItem[]>);

    return Object.keys(grouped).map(dateStr => ({
      title: dateStr,
      data: grouped[dateStr],
    }));
  }, [flattenedData]);

  const renderIcon = (type: string, event: string) => {
    if (type === 'connection') {
      return (
        <View className={`size-10 items-center justify-center rounded-full ${event === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <MaterialCommunityIcons
            name={event === 'online' ? 'wifi' : 'wifi-off'}
            size={20}
            color={event === 'online' ? '#10B981' : '#EF4444'}
          />
        </View>
      );
    }
    return (
      <View className="size-10 items-center justify-center rounded-full bg-blue-500/20">
        <MaterialCommunityIcons name="history" size={20} color="#3B82F6" />
      </View>
    );
  };

  const renderDescription = (item: TDeviceTimelineItem) => {
    if (item.type === 'connection') {
      return item.event === 'online' ? 'Thiết bị trực tuyến' : 'Thiết bị ngoại tuyến';
    }
    const sourceStr = item.source ? ` (qua ${item.source === 'app' ? 'Ứng dụng' : item.source.toUpperCase()})` : '';
    const nameStr = item.entityName ? `[${item.entityName}] ` : '';
    return `${nameStr}Trạng thái: ${item.event}${sourceStr}`;
  };

  const renderItem = ({ item, index, section }: { item: TDeviceTimelineItem; index: number; section: any }) => {
    const isLastItem = index === section.data.length - 1;
    return (
      <View className="flex-row items-center bg-[#1B1B1B] px-5 py-4">
        {renderIcon(item.type, item.event)}
        <View className={`ml-4 flex-1 ${!isLastItem ? 'border-b border-neutral-800 pb-4' : ''}`}>
          <Text className="text-base font-semibold text-white">
            {renderDescription(item)}
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">
            {dayjs(item.createdAt).format('HH:mm:ss')}
          </Text>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View className="bg-neutral-900 px-5 py-3">
      <Text className="text-sm font-bold text-neutral-400">{title}</Text>
    </View>
  );

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-neutral-800 px-5 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2"
          >
            <AntDesign name="left" size={20} color="#fff" />
          </TouchableOpacity>
          <View className="flex-1 items-center px-4">
            <Text className="line-clamp-1 text-center text-lg font-bold text-white" numberOfLines={1}>
              {(translate('deviceDetail.timeline.title' as TxKeyPath) || 'Lịch sử hoạt động') as string}
            </Text>
            {device && (
              <Text className="line-clamp-1 text-xs text-neutral-400" numberOfLines={1}>
                {device.name}
              </Text>
            )}
          </View>
          <View className="w-8" />
        </View>

        {isLoading && !isRefetching
          ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            )
          : isError
            ? (
                <View className="flex-1 items-center justify-center px-6">
                  <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
                  <Text className="mt-4 text-center text-red-400">
                    Đã có lỗi xảy ra khi tải lịch sử. Vui lòng thử lại.
                  </Text>
                </View>
              )
            : sections.length === 0
              ? (
                  <View className="flex-1 items-center justify-center px-6">
                    <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#555" />
                    <Text className="mt-4 text-center text-neutral-400">
                      Chưa có dữ liệu hoạt động nào của thiết bị này.
                    </Text>
                  </View>
                )
              : (
                  <SectionList
                    sections={sections}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    stickySectionHeadersEnabled
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => (
                      <View className="h-16 items-center justify-center">
                        {isFetchingNextPage && <ActivityIndicator size="small" color="#888" />}
                      </View>
                    )}
                  />
                )}
      </SafeAreaView>
    </View>
  );
}
