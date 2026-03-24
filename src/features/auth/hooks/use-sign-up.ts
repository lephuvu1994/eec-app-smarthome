import type { EHomeRole } from '@/features/auth/types/response';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { showErrorMessage } from '@/components/ui';
import { authService } from '@/lib/api/auth/auth.service';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';
import { useUserManager } from '../user-store';

export function useSignUp() {
  const signIn = useUserManager(s => s.signIn);
  const router = useRouter();

  const { mutateAsync: submitSignUp, isPending: isSigningUp } = useMutation({
    mutationFn: async (variables: { identifier: string; password: string }) => {
      return authService.signup({
        identifier: variables.identifier,
        password: variables.password,
      });
    },
    onSuccess: (response) => {
      signIn({
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        avatar: response.user.avatar,
        userName: response.user.email?.split('@')[0] ?? response.user.phone ?? '',
        role: response.user.role,
        created_at: response.user.createdAt,
        updated_at: response.user.updatedAt,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      // Set homes from auth response — server creates default home on signup
      const homes = response.homes ?? [];
      const { clearSelectedHome, setHomes, setSelectedHome } = useHomeStore.getState();
      clearSelectedHome();
      setHomes(homes as any);
      if (homes.length > 0) {
        setSelectedHome(homes[0] as any, homes[0].role as EHomeRole);
      }

      router.replace('/(app)');
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('formAuth.signupFailed'));
    },
  });

  const { mutateAsync: checkAccountExists, isPending: isChecking } = useMutation({
    mutationFn: async (identifier: string) => {
      const result = await authService.checkExists(identifier);
      return result.exists;
    },
  });

  const handleCheckAndProceed = async (
    identifier: string,
    onNewAccount: () => void,
  ) => {
    try {
      const exists = await checkAccountExists(identifier);
      if (exists) {
        showErrorMessage(translate('formAuth.accountAlreadyExists'));
      }
      else {
        onNewAccount();
      }
    }
    catch (error) {
      console.error(error);
    }
  };

  return {
    submitSignUp,
    isSigningUp,
    isChecking,
    handleCheckAndProceed,
  };
}
