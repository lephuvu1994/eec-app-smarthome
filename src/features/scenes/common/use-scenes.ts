import type { TScene } from '@/lib/api/scenes/scene.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showErrorMessage } from '@/components/ui';
import { sceneService } from '@/lib/api/scenes/scene.service';
import { translate } from '@/lib/i18n';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const sceneKeys = {
  all: ['scenes'] as const,
  byHome: (homeId: string) => [...sceneKeys.all, homeId] as const,
  detail: (sceneId: string) => [...sceneKeys.all, 'detail', sceneId] as const,
};

// ─── useScenes ────────────────────────────────────────────────────────────────
/**
 * Fetch danh sách scenes theo homeId.
 * Không show loading spinner — data hiện ngay từ cache, refresh ngầm.
 */
export function useScenes(homeId: string | null) {
  return useQuery<TScene[]>({
    queryKey: sceneKeys.byHome(homeId ?? ''),
    queryFn: () => sceneService.getScenes(homeId!),
    enabled: !!homeId,
    staleTime: 30_000, // 30s cache trước khi background refetch
  });
}

// ─── useSceneDetail ───────────────────────────────────────────────────────────
export function useSceneDetail(sceneId: string, enabled = true) {
  return useQuery<TScene>({
    queryKey: sceneKeys.detail(sceneId),
    queryFn: () => sceneService.getScene(sceneId),
    enabled: !!sceneId && enabled,
    staleTime: 30_000,
  });
}

// ─── useUpdateScene ───────────────────────────────────────────────────────────
export function useUpdateScene(sceneId: string, homeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TScene>) => sceneService.updateScene(sceneId, data as any),
    onSuccess: () => {
      // Invalidate both the list and the detail cache
      if (homeId) {
        queryClient.invalidateQueries({ queryKey: sceneKeys.byHome(homeId) });
      }
      queryClient.invalidateQueries({ queryKey: sceneKeys.detail(sceneId) });
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

// ─── useRunScene ──────────────────────────────────────────────────────────────
export function useRunScene() {
  return useMutation({
    mutationFn: (sceneId: string) => sceneService.runScene(sceneId),
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

// ─── useDelayScene ────────────────────────────────────────────────────────────
export function useDelayScene() {
  return useMutation({
    mutationFn: ({ sceneId, delaySeconds }: { sceneId: string; delaySeconds: number }) =>
      sceneService.runScene(sceneId, delaySeconds),
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

// ─── useDeleteScene ───────────────────────────────────────────────────────────
export function useDeleteScene(homeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sceneId: string) => sceneService.deleteScene(sceneId),
    onSuccess: () => {
      if (homeId) {
        queryClient.invalidateQueries({ queryKey: sceneKeys.byHome(homeId) });
      }
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

// ─── useReorderScenes ─────────────────────────────────────────────────────────
/**
 * Optimistic reorder: cập nhật cache ngay → gọi API nền → rollback nếu fail.
 */
export function useReorderScenes(homeId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sceneIds: string[]) => sceneService.reorderScenes(homeId!, sceneIds),

    onMutate: async (sceneIds: string[]) => {
      if (!homeId)
        return;
      const queryKey = sceneKeys.byHome(homeId);

      // Cancel in-flight queries tránh overwrite
      await queryClient.cancelQueries({ queryKey });

      // Snapshot cache cũ để rollback
      const previousScenes = queryClient.getQueryData<TScene[]>(queryKey);

      // Optimistic update: sắp xếp cache theo thứ tự mới
      if (previousScenes) {
        const idToScene = Object.fromEntries(previousScenes.map(s => [s.id, s]));
        const reordered = sceneIds
          .map((id, index) => {
            const scene = idToScene[id];
            return scene ? { ...scene, sortOrder: index } : undefined;
          })
          .filter(Boolean) as TScene[];

        // Ghép lại scene không có trong sceneIds (edge case)
        const remaining = previousScenes.filter(s => !sceneIds.includes(s.id));
        queryClient.setQueryData<TScene[]>(queryKey, [...reordered, ...remaining]);
      }

      return { previousScenes };
    },

    onError: (error: any, _sceneIds, context) => {
      // Rollback về cache cũ
      if (homeId && context?.previousScenes) {
        queryClient.setQueryData(sceneKeys.byHome(homeId), context.previousScenes);
      }
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },

    onSettled: () => {
      // Background refetch để sync chính xác
      if (homeId) {
        queryClient.invalidateQueries({ queryKey: sceneKeys.byHome(homeId) });
      }
    },
  });
}
