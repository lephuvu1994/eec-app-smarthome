import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';

import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { SharedTimelineScreen } from '@/components/base/timeline/shared-timeline-screen';
import { useDeviceTimelineInfinite } from '@/features/devices/automation/timeline/use-device-timeline';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';

import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function DeviceTimelineScreen() {
  const { id: deviceId } = useLocalSearchParams<{ id: string }>();
  const device = useDeviceStore((s: any) => s.devices.find((d: any) => d.id === deviceId));

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
  const flattenedData = React.useMemo(() => data?.pages.flatMap(page => page.data) || [], [data?.pages]);

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

  return (
    <>
      <SharedTimelineScreen
        title={translate('base.timelineTitle' as TxKeyPath) || 'Lịch sử hoạt động'}
        showBackButton={true}
        fallbackDeviceName={device?.name}
        sections={sections}
        isLoading={isLoading}
        isRefetching={isRefetching}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage || false}
        emptyText={(translate('deviceDetail.timeline.noActivity' as TxKeyPath) || 'Chưa có hoạt động') as string}
        onLoadMore={() => fetchNextPage()}
      />
    </>
  );
}
