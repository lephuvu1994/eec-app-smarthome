import type { LoginFormProps } from '@/features/auth/components/login-form';
import type { UserResponse } from '@/features/auth/types/response';

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideInUp,
} from 'react-native-reanimated';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { showErrorMessage, Text, View } from '@/components/ui';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useGetUser } from '@/features/auth/user-store';
import { useLogin } from '@/lib/api';

export function SignIn() {
  const router = useRouter();
  const signIn = useAuthStore.use.signIn();
  const setUserStore = useGetUser.use.setUser();

  const { mutate: login } = useLogin();

  const onSubmit: LoginFormProps['onSubmit'] = async (data: any) => {
    login(
      { identifier: data.identifier, password: data.password },
      {
        onSuccess: (data: UserResponse) => {
          if (data.statusCode !== 200) {
            showErrorMessage(`Login falied ${JSON.stringify(data.message)}`);
          }
          else if (data) {
            signIn({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            });
            setUserStore(data.data.user);
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
      <View className="flex-1 flex-col">
        <View className="top-0 h-1/2 w-full justify-center gap-8 px-4">
          <Animated.View
            className="w-full items-center justify-center"
            entering={SlideInUp.duration(800)}
          >
            <Image
              source={require('@@/assets/logo.png')}
              className="size-28"
              style={{ width: 112, height: 112 }}
              contentFit="contain"
            />
          </Animated.View>
          <View className="w-full items-center justify-center gap-4">
            <Animated.View
              className="w-full items-center justify-center"
              entering={SlideInLeft.delay(200).duration(800)}
            >
              <Text
                style={{ fontFamily: 'rightTeous' }}
                className="text-4xl font-bold text-white uppercase"
              >
                Welcome to
              </Text>
            </Animated.View>
            <Animated.View
              className="w-full items-center justify-center"
              entering={SlideInRight.delay(200).duration(800)}
            >
              <Text
                style={{ fontFamily: 'rightTeous' }}
                className="text-4xl font-bold text-white uppercase"
              >
                Euro SmartHome
              </Text>
            </Animated.View>
          </View>
        </View>
        <LoginForm onSubmit={onSubmit} />
      </View>
    </BaseLayout>
  );
}
