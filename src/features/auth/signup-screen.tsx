import React from 'react';
import Animated, { SlideInLeft, SlideInRight, SlideInUp } from 'react-native-reanimated';

import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';

import { SignUpForm, SignUpFormProps } from '@/features/auth/components/signup-form';
import {
  showErrorMessage,
  showSuccessMessage,
  Text,
  View,
  Image
} from '@/components/ui';
import { TUser, UserResponse } from './types/response';
import { client } from '@/lib/api';
import { signIn } from './use-auth-store';
import { setUserStore } from '@/lib/auth/user';
import { BaseLayout } from '@/components/layout/BaseLayout';

export function SignUp() {
  const { mutate: signUp, isPending: isPendingSignUp } = useMutation({
    mutationFn: async (variables: any) => {
      const resultData = await client.post<UserResponse>(
        '/auth/signup',
        variables
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
          } else {
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
      }
    );
  };
  return (
    <BaseLayout hasTabBar={false}>
      <View className="flex-1 flex-col">
        <View className="h-1/2 top-0 justify-center px-4 w-full gap-8">
          <Animated.View
            className="w-full justify-center items-center"
            entering={SlideInUp.duration(800)}
          >
            <Image
              source={require('@@/assets/logo.png')}
              className="w-28 h-28"
              style={{ width: 112, height: 112 }}
              contentFit="contain"
            />
          </Animated.View>
          <View className="w-full justify-center items-center gap-4">
            <Animated.View
              className="w-full justify-center items-center"
              entering={SlideInLeft.delay(200).duration(800)}
            >
              <Text
                style={{ fontFamily: 'rightTeous' }}
                className="text-white text-4xl font-bold uppercase"
              >
                Welcome to
              </Text>
            </Animated.View>
            <Animated.View
              className="w-full justify-center items-center"
              entering={SlideInRight.delay(200).duration(800)}
            >
              <Text
                style={{ fontFamily: 'rightTeous' }}
                className="text-white text-4xl font-bold uppercase"
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
