import type { TDeviceTimelineItem } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';

import { TouchableOpacity } from 'react-native';
import { useUniwind } from 'uniwind';
import { SharedTimelineScreen } from '@/components/base/timeline/shared-timeline-screen';
import { useHomeTimelineInfinite } from '@/features/home-screen/hooks/use-home-timeline';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';
import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function HomeActivityScreen() {
  const router = useRouter();
  const { theme } = useUniwind();

  const selectedHome = useHomeStore(s => s.selectedHome);
  const homeId = selectedHome?.id as string;

  const {
    data,
    isLoading,
    isRefetching,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeTimelineInfinite(homeId);

  // Flatten and group the data
  const flattenedData = React.useMemo(() => data?.pages.flatMap(page => page.data || page) || [], [data?.pages]);

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
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: (translate('base.timelineTitle' as TxKeyPath) || 'Lịch sử hoạt động') as string,
          headerTitleStyle: {
            color: theme === ETheme.Dark ? '#fff' : '#111',
            fontSize: 18,
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="h-9 w-10 items-center justify-center">
              <Ionicons name="chevron-back" size={28} color={theme === ETheme.Dark ? '#fff' : '#111'} />
            </TouchableOpacity>
          ),
        }}
      />
      <SharedTimelineScreen
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
