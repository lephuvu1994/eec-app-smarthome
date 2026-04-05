import type { TxKeyPath } from '@/lib/i18n';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { SharedTimelinePopover } from '@/components/base/timeline/shared-timeline-popover';
import { useDeviceTimelineInfinite } from '@/features/devices/hooks/use-device-timeline';

import { translate } from '@/lib/i18n';

import { useDeviceStore } from '@/stores/device/device-store';

type Props = {
  deviceId: string;
  renderTrigger: (sourceRef: React.RefObject<any>, openPopover: () => void) => React.ReactNode;
  fromRect?: any;
};

export function TimelinePopover({ deviceId, renderTrigger, fromRect }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useDeviceTimelineInfinite(deviceId, { limit: 10 });
  const items = data?.pages.flatMap((page: any) => page.data) || [];
  const device = useDeviceStore(s => s.devices.find(d => d.id === deviceId));

  return (
    <SharedTimelinePopover
      fallbackDeviceName={device?.name}
      items={items}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => hasNextPage && fetchNextPage()}
      title={(translate('base.timelineTitle' as TxKeyPath) || 'Lịch sử hoạt động') as string}
      emptyText={(translate('deviceDetail.timeline.noActivity' as TxKeyPath) || 'Chưa có hoạt động') as string}
      onViewAll={() => {
        router.push(`/device/${deviceId}/timeline`);
      }}
      renderTrigger={renderTrigger}
      fromRect={fromRect}
    />
  );
}
