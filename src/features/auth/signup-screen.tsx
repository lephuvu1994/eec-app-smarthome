import type { TUser, UserResponse } from './types/response';
import type { SignUpFormProps } from '@/features/auth/components/signup-form';

import { useMutation } from '@tanstack/react-query';

import Animated, { SlideInLeft, SlideInRight, SlideInUp } from 'react-native-reanimated';
import { BaseLayout } from '@/components/layout/BaseLayout';
import {
  Image,
  showErrorMessage,
  showSuccessMessage,
  Text,
  View,
} from '@/components/ui';
import { SignUpForm } from '@/features/auth/components/signup-form';
import { client } from '@/lib/api';
import { setUserStore } from '@/lib/auth/user';
import { signIn } from './use-auth-store';

export function SignUp() {
  const { mutate: signUp } = useMutation({
    mutationFn: async (variables: any) => {
      const resultData = await client.post<UserResponse>(
        '/auth/signup',
        variables,
      );
      return resultData.data;
    },
  });

  const onSubmit: SignUpFormProps['onSubmit'] = async (data: any) => {
    signUp(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        identifier: data.identifier,
        password: data.password,
      },
      {
        onSuccess: (data: UserResponse) => {
          if (data.statusCode !== 201 && data.message) {
            showErrorMessage(`Sign up falied ${JSON.stringify(data.message)}`);
          }
          else {
            showSuccessMessage('Đăng ký tài khoản admin thành công !');
            signIn({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            });
            setUserStore(data.data.user as TUser);
          }
        },
        onError: (error: any) => {
          showErrorMessage(`Sign up falied ${JSON.stringify(error)}`);
        },
      },
    );
  };
  return (
    <BaseLayout>
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
        <SignUpForm onSubmit={onSubmit} />
      </View>
    </BaseLayout>
  );
}
