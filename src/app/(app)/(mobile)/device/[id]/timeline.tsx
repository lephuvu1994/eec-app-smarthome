import type { TxKeyPath } from '@/lib/i18n';

import dayjs from 'dayjs';
import { useLocalSearchParams } from 'expo-router';

import { SharedTimelineScreen } from '@/components/base/timeline/shared-timeline-screen';
import { TimelineTabView } from '@/components/base/timeline/timeline-tab-view';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';

import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function DeviceTimelineScreen() {
  const { id: deviceId } = useLocalSearchParams<{ id: string }>();
  const device = useDeviceStore((s: any) => s.devices.find((d: any) => d.id === deviceId));

  return (
    <SharedTimelineScreen
      title={translate('base.timelineTitle' as TxKeyPath)}
      showBackButton={true}
    >
      <TimelineTabView
        contextType="device"
        targetId={deviceId as string}
        fallbackDeviceName={device?.name}
      />
    </SharedTimelineScreen>
  );
}
