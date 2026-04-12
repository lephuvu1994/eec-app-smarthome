import type { TCreateSceneDto } from '@/lib/api/scenes/scene.service';
import type { TSceneAction } from '@/types/scene';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { showErrorMessage, showSuccessMessage } from '@/components/ui';
import { sceneKeys } from '@/features/scenes/common/use-scenes';
import { sceneService } from '@/lib/api/scenes/scene.service';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';

export type { TSceneAction };

// ─── useSceneBuilder ──────────────────────────────────────────────────────────

export function useSceneBuilder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const homeId = useHomeStore.use.selectedHomeId();

  const { mutateAsync: createScene, isPending: isCreating } = useMutation({
    mutationFn: (dto: TCreateSceneDto) => sceneService.createScene(dto),
    onSuccess: () => {
      // Invalidate scene list so danh sách refresh tức thì khi quay về
      if (homeId) {
        queryClient.invalidateQueries({ queryKey: sceneKeys.byHome(homeId) });
      }
      showSuccessMessage(translate('scenes.builder.createSuccess'));
      router.back();
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });

  return {
    createScene,
    isCreating,
    homeId,
  };
}
