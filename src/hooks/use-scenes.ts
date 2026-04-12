import { TRunSceneResponse, TScene } from '@/types/scene';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sceneService } from '@/lib/api/scenes/scene.service';

// ============================================================
// QUERY KEYS
// ============================================================
export const sceneKeys = {
  all: ['scenes'] as const,
  list: (homeId: string) => ['scenes', 'list', homeId] as const,
  detail: (sceneId: string) => ['scenes', 'detail', sceneId] as const,
};

// ============================================================
// HOOKS
// ============================================================

/** Get scenes for a specific home */
export function useScenes(homeId: string) {
  return useQuery<TScene[]>({
    queryKey: sceneKeys.list(homeId),
    queryFn: () => sceneService.getScenes(homeId),
    enabled: !!homeId,
  });
}

/** Run a scene — mutation hook */
export function useRunScene() {
  const queryClient = useQueryClient();

  return useMutation<TRunSceneResponse, Error, string>({
    mutationFn: (sceneId: string) => sceneService.runScene(sceneId),
    onSuccess: () => {
      // Optionally invalidate devices after scene runs
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}
