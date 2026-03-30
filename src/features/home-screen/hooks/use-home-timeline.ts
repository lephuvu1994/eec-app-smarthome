import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { homeService } from '@/lib/api/homes/home.service';

export const homeTimelineKeys = {
  all: ['home-timeline'] as const,
  lists: () => [...homeTimelineKeys.all, 'list'] as const,
  list: (homeId: string, filters?: Record<string, unknown>) =>
    [...homeTimelineKeys.lists(), homeId, filters] as const,
};

/**
 * Hook to fetch the latest N timeline items (for popover preview)
 */
export function useHomeTimelinePreview(homeId: string, limit = 5) {
  return useQuery({
    queryKey: homeTimelineKeys.list(homeId, { preview: true, limit }),
    queryFn: () => homeService.getHomeActivity(homeId, 1, limit),
    enabled: !!homeId,
    refetchInterval: 10000,
  });
}

/**
 * Infinite query to fetch home timeline with pagination
 */
export function useHomeTimelineInfinite(
  homeId: string,
  options?: { limit?: number },
) {
  const limit = options?.limit ?? 30;

  return useInfiniteQuery({
    queryKey: homeTimelineKeys.list(homeId, { infinite: true, ...options }),
    queryFn: async ({ pageParam = 1 }) => {
      return homeService.getHomeActivity(homeId, pageParam as number, limit);
    },
    getNextPageParam: (lastPage) => {
      const { page, lastPage: maxPage } = lastPage.meta;
      if (page < maxPage) {
        return page + 1;
      }
      return undefined;
    },
    enabled: !!homeId,
    initialPageParam: 1,
  });
}
