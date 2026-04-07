import type { TLoginFormProps } from '@/features/auth/components/login-form';
import type { EHomeRole, UserResponse } from '@/features/auth/types/response';

import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { showErrorMessage, Text, View } from '@/components/ui';
import { LoginForm } from '@/features/auth/components/login-form';
import { useUserManager } from '@/features/auth/user-store';
import { useLogin } from '@/lib/api';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';

export function SignIn() {
  const router = useRouter();
  const { signIn } = useUserManager();
  const headerHeight = useHeaderHeight();

  const { mutateAsync: login } = useLogin();

  const onSubmit: TLoginFormProps['onSubmit'] = async (data: any) => {
    await login(
      { identifier: data.identifier, password: data.password },
      {
        onSuccess: (data: UserResponse) => {
          if (data.statusCode !== 200) {
            showErrorMessage(translate('formAuth.loginFailed'));
          }
          else if (data) {
            signIn({ ...data.data.user, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });

            // Set homes from auth response — eliminates stale homeId race condition
            const homes = data.data.homes ?? [];
            const { clearSelectedHome, setHomes, setSelectedHome } = useHomeStore.getState();
            clearSelectedHome();
            setHomes(homes as any);
            if (homes.length > 0) {
              setSelectedHome(homes[0] as any, homes[0].role as EHomeRole);
            }

            router.push('/(app)');
          }
        },
        onError: (_error: any) => {
          showErrorMessage(translate('formAuth.loginFailed'));
        },
      },
    );
  };

  return (
    <BaseLayout hasTabBar={false}>
      <View className="relative w-full flex-1">
        <Image
          source={require('@@/assets/sign-in/background-signIn.webp')}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          contentFit="cover"
        />
        <View className="gap-6 px-4" style={{ paddingTop: headerHeight }}>

          <Image
            source={require('@@/assets/short_logo.png')}
            style={{
              width: 120,
              height: 120,
            }}
            contentFit="contain"
          />
          <Text className="text-4xl font-bold text-[#1B1B1B]" tx="formAuth.titleSignIn" />
        </View>
        <LoginForm onSubmit={onSubmit} />
      </View>
    </BaseLayout>
  );
}
