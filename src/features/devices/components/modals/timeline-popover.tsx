import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Dimensions, ScrollView, TouchableOpacity } from 'react-native';

import Popover, { PopoverPlacement } from 'react-native-popover-view';
import { Text, View } from '@/components/ui';
import { useDeviceTimelinePreview } from '@/features/devices/hooks/use-device-timeline';
import { EDeviceTimelineEvent, EDeviceTimelineType } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';

import { ETheme } from '@/types/base';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  deviceId: string;
  renderTrigger: (sourceRef: React.RefObject<any>, openPopover: () => void) => React.ReactNode;
};

export function TimelinePopover({ deviceId, renderTrigger }: Props) {
  const router = useRouter();
  const theme = useConfigManager((s: any) => s.theme);
  const isDark = theme === ETheme.Dark;
  const [isVisible, setIsVisible] = React.useState(false);

  // Mở popover thì mới enable query
  const { data, isLoading, isError } = useDeviceTimelinePreview(deviceId, 5);
  const items = data?.data || [];

  const handleViewAll = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.push(`/device/${deviceId}/timeline`);
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
    if (item.type === EDeviceTimelineType.Connection) {
      return item.event === EDeviceTimelineEvent.Online
        ? (translate('deviceDetail.timeline.deviceOnline' as TxKeyPath) as string)
        : (translate('deviceDetail.timeline.deviceOffline' as TxKeyPath) as string);
    }

    // Translation fallback mapping
    const i18nEvent = translate(`deviceDetail.timeline.events.${item.event}` as TxKeyPath) || item.event;
    const i18nSource = item.source ? (translate(`deviceDetail.timeline.sources.${item.source}` as TxKeyPath) || item.source) : null;
    const namePrefix = item.entityName ? `[${item.entityName}] ` : '';

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
      <View className="relative p-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-bold text-neutral-900 dark:text-white">
            {(translate('deviceDetail.timeline.title' as TxKeyPath) || 'Lịch sử hoạt động') as string}
          </Text>
          <TouchableOpacity onPress={() => setIsVisible(false)} className="size-6 items-center justify-center rounded-full bg-black/10 dark:bg-neutral-800">
            <MaterialCommunityIcons name="close" size={14} color={isDark ? '#A3A3A3' : '#666'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
          {isLoading && (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="small" color="#888" />
            </View>
          )}

          {isError && (
            <Text className="py-4 text-center text-sm text-red-500">Lỗi tải dữ liệu. Thử lại sau.</Text>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <View className="items-center justify-center py-6">
              <MaterialCommunityIcons name="clipboard-text-outline" size={36} color="#555" />
              <Text className="mt-3 text-sm text-neutral-400">Chưa có hoạt động</Text>
            </View>
          )}

          {items.map((item, idx) => (
            <View key={item.id || `timeline-${idx}`} className="mb-3 flex-row items-start gap-3">
              {renderIcon(item.type, item.event)}
              <View className={`flex-1 shrink ${idx !== items.length - 1 ? 'border-b border-black/5 pb-3 dark:border-neutral-800' : ''}`}>
                <Text className="text-sm/5 font-medium text-neutral-800 dark:text-neutral-200">
                  {renderDescription(item)}
                </Text>
                <Text className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {dayjs(item.createdAt).format('HH:mm - DD/MM/YYYY')}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {!isLoading && !isError && items.length > 0 && (
          <TouchableOpacity
            onPress={handleViewAll}
            activeOpacity={0.8}
            className="mt-3 w-full items-center rounded-xl bg-blue-600/20 py-3"
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
