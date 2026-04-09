import type { TxKeyPath } from '@/lib/i18n';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { SharedTimelinePopover } from '@/components/base/timeline/shared-timeline-popover';

import { translate } from '@/lib/i18n';

import { useDeviceStore } from '@/stores/device/device-store';

type Props = {
  deviceId: string;
  trigger: React.ReactElement;
};

export function TimelinePopover({ deviceId, trigger }: Props) {
  const router = useRouter();
  const device = useDeviceStore(s => s.devices.find(d => d.id === deviceId));

  return (
    <SharedTimelinePopover
      fallbackDeviceName={device?.name}
      targetId={deviceId}
      contextType="device"
      title={(translate('base.timelineTitle' as TxKeyPath) || 'Lịch sử hoạt động') as string}
      onViewAll={() => {
        router.push(`/device/${deviceId}/timeline`);
      }}
      trigger={trigger}
    />
  );
}
