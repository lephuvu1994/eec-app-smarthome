import type { TxKeyPath } from '@/lib/i18n';

import dayjs from 'dayjs';

import { SharedTimelineScreen } from '@/components/base/timeline/shared-timeline-screen';
import { TimelineTabView } from '@/components/base/timeline/timeline-tab-view';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';

import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function HomeActivityScreen() {
  const selectedHome = useHomeStore(s => s.selectedHome);
  const homeId = selectedHome?.id as string;

  return (
    <SharedTimelineScreen
      title={translate('base.timelineTitle' as TxKeyPath) || 'Lịch sử hoạt động'}
      showBackButton={true}
    >
      <TimelineTabView
        contextType="home"
        targetId={homeId}
      />
    </SharedTimelineScreen>
  );
}
