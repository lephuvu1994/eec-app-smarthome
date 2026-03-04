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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

export function SignUp() {
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
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
      <View className="flex-1 w-full relative">
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
        <View className="px-4 gap-6" style={{ paddingTop: top + headerHeight - 32 }}>
          <Image
            source={require('@@/assets/base/icon.png')}
            style={{
              width: 60,
              height: 60,
            }}
            contentFit="cover"
          />
          <Text className="text-4xl font-bold text-[#1B1B1B]" tx="base.signUp" />
        </View>
        <SignUpForm onSubmit={onSubmit} />
      </View>
    </BaseLayout>
  );
}
