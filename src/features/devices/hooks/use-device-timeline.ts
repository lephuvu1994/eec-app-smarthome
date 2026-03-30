import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { deviceService } from '@/lib/api/devices/device.service';

export const timelineKeys = {
  all: ['device-timeline'] as const,
  lists: () => [...timelineKeys.all, 'list'] as const,
  list: (deviceId: string, filters?: Record<string, unknown>) =>
    [...timelineKeys.lists(), deviceId, filters] as const,
};

/**
 * Hook to fetch the latest N timeline items (for popover preview)
 */
export function useDeviceTimelinePreview(deviceId: string, limit = 5) {
  return useQuery({
    queryKey: timelineKeys.list(deviceId, { preview: true, limit }),
    queryFn: () => deviceService.getDeviceTimeline(deviceId, { page: 1, limit }),
    enabled: !!deviceId,
    refetchInterval: 10000, // optionally refetch every 10s if kept open
  });
}

/**
 * Infinite query to fetch device timeline with pagination (for full timeline screen)
 */
export function useDeviceTimelineInfinite(
  deviceId: string,
  options?: { limit?: number; entityCode?: string; from?: string; to?: string },
) {
  const limit = options?.limit ?? 30;

  return useInfiniteQuery({
    queryKey: timelineKeys.list(deviceId, { infinite: true, ...options }),
    queryFn: async ({ pageParam = 1 }) => {
      return deviceService.getDeviceTimeline(deviceId, {
        page: pageParam as number,
        limit,
        entityCode: options?.entityCode,
        from: options?.from,
        to: options?.to,
      });
    },
    // The meta.lastPage determines if there's more data
    getNextPageParam: (lastPage) => {
      const { page, lastPage: maxPage } = lastPage.meta;
      if (page < maxPage) {
        return page + 1;
      }
      return undefined;
    },
    enabled: !!deviceId,
    initialPageParam: 1,
  });
}
