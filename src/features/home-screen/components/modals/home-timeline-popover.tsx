import type { TxKeyPath } from '@/lib/i18n';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { SharedTimelinePopover } from '@/components/base/timeline/shared-timeline-popover';
import { useHomeTimelineInfinite } from '@/features/home-screen/hooks/use-home-timeline';
import { translate } from '@/lib/i18n';

type Props = {
  homeId: string;
  trigger: React.ReactElement;
};

export function HomeTimelinePopover({ homeId, trigger }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useHomeTimelineInfinite(homeId, { limit: 10 });
  const items = data?.pages.flatMap(page => page.data) || [];

  return (
    <SharedTimelinePopover
      items={items}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => hasNextPage && fetchNextPage()}
      title={(translate('base.timelineTitle' as TxKeyPath) || 'Lịch sử hoạt động') as string}
      emptyText={(translate('deviceDetail.timeline.noActivity' as TxKeyPath) || 'Chưa có hoạt động') as string}
      onViewAll={() => {
        router.push('/(home)/home-activity');
      }}
      trigger={trigger}
    />
  );
}
