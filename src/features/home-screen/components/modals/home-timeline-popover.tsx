import type { TxKeyPath } from '@/lib/i18n';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { SharedTimelinePopover } from '@/components/base/timeline/shared-timeline-popover';
import { translate } from '@/lib/i18n';

type Props = {
  homeId: string;
  trigger: React.ReactElement;
};

export function HomeTimelinePopover({ homeId, trigger }: Props) {
  const router = useRouter();

  return (
    <SharedTimelinePopover
      contextType="home"
      targetId={homeId}
      title={(translate('base.timelineTitle' as TxKeyPath) || 'Lịch sử hoạt động') as string}
      onViewAll={() => {
        router.push('/(home)/home-activity');
      }}
      trigger={trigger}
    />
  );
}
