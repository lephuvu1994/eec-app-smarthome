import type { TLoginFormProps } from '@/features/auth/components/login-form';
import type { UserResponse } from '@/features/auth/types/response';

import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { showErrorMessage, Text, View } from '@/components/ui';
import { LoginForm } from '@/features/auth/components/login-form';
import { useUserManager } from '@/features/auth/user-store';
import { useLogin } from '@/lib/api';

export function SignIn() {
  const router = useRouter();
  const { signIn } = useUserManager();
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { mutateAsync: login } = useLogin();

  const onSubmit: TLoginFormProps['onSubmit'] = async (data: any) => {
    await login(
      { identifier: data.identifier, password: data.password },
      {
        onSuccess: (data: UserResponse) => {
          if (data.statusCode !== 200) {
            showErrorMessage(`Login falied ${JSON.stringify(data.message)}`);
          }
          else if (data) {
            signIn({ ...data.data.user, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
            router.push('/(app)');
          }
        },
        onError: (error: any) => {
          showErrorMessage(`Login falied ${JSON.stringify(error)}`);
        },
      },
    );
  };

  return (
    <BaseLayout hasTabBar={false}>
      <View className="relative w-full flex-1">
        <Image
          source={require('@@/assets/sign-in/background-signIn.png')}
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
        <View className="gap-6 px-4" style={{ paddingTop: top + headerHeight - 32 }}>
          <Image
            source={require('@@/assets/base/icon.png')}
            style={{
              width: 60,
              height: 60,
            }}
            contentFit="cover"
          />
          <Text className="text-4xl font-bold text-[#1B1B1B]" tx="formAuth.titleSignIn" />
        </View>
        <LoginForm onSubmit={onSubmit} />
      </View>
    </BaseLayout>
  );
}
