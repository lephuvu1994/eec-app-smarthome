import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useForm } from '@tanstack/react-form';
import { BlurView } from 'expo-blur';

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from 'tailwind-variants';
import * as z from 'zod';
import {
  Button,
  FloatInput,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { translate } from '@/lib/i18n';

const schema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, translate('formAuth.error.identifierRequired'))
    .pipe(z.email({ message: translate('formAuth.error.invalidFormatIdentifier') })),
  password: z
    .string()
    .trim()
    .min(1, translate('formAuth.error.passwordRequired'))
    .min(6, translate('formAuth.error.passwordInvalidFormat')),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit: (value: FormType) => Promise<void>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { bottom } = useSafeAreaInsets();

  const form = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },

    validators: {
      onChange: schema as any,
      onSubmit: schema as any,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={-120}
      className="absolute size-full justify-end px-4"
    >
      <Animated.View
        entering={FadeInUp.delay(100)
          .duration(500)
          .withInitialValues({
            transform: [{ translateY: '50%' }],
            opacity: 0,
          })}
        className="w-full overflow-hidden"
        style={{
          height: 500 + bottom,
          marginBottom: bottom,
        }}
      >
        <BlurView
          intensity={40}
          tint="light"
          style={{ ...StyleSheet.absoluteFillObject }}
          className="relative overflow-hidden rounded-3xl"
        >

          <View
            className="flex-1 rounded-3xl border border-white/25 bg-white/70 dark:bg-white/70"
          >
            <View className="flex-1 rounded-3xl border border-white/25 bg-white/70 dark:bg-white/70">
              <View className="flex-1 justify-between py-6">
                <View className="mx-4 mt-2 items-center">
                  <View className="w-full gap-4">
                    <View className="w-full gap-2">
                      <View className="relative w-full">
                        <form.Field
                          name="identifier"
                          children={field => (
                            <FloatInput
                              value={field.state.value}
                              onChangeText={field.handleChange}
                              onBlur={field.handleBlur}
                              label={translate('formAuth.titleIdentifier')}
                              testID="identifier"
                              inputClassName="text-[#1B1B1B] dark:text-[#1B1B1B]"
                              containerClassName="bg-[#F3F4F6] shadow"
                              labelTextColor="#737373"
                              labelTextColorInactive="#737373"
                              placeholderTextColor="text-[#737373] dark:text-[#737373]"
                              borderColor={{
                                active: '#737373',
                                inactive: 'transparent',
                              }}
                              error={getFieldError(field)}
                              rightIcon={<Fontisto name="email" size={18} color="#9CA3AF" />}
                            />
                          )}
                        />
                      </View>
                    </View>

                    <View className="w-full gap-2">
                      <View className="relative mb-2 w-full">
                        <form.Field
                          name="password"
                          children={field => (
                            <FloatInput
                              value={field.state.value}
                              onChangeText={field.handleChange}
                              onBlur={field.handleBlur}
                              testID="password-input"
                              label={translate('formAuth.titlePassword')}
                              secureTextEntry={!showPassword}
                              inputClassName="text-[#1B1B1B] dark:text-[#1B1B1B]"
                              containerClassName="bg-[#F3F4F6] shadow"
                              labelTextColor="#737373"
                              labelTextColorInactive="#737373"
                              borderColor={{
                                active: '#737373',
                                inactive: 'transparent',
                              }}
                              placeholderTextColor="text-[#737373] dark:text-[#737373]"
                              error={getFieldError(field)}
                              rightIcon={(
                                <TouchableOpacity
                                  onPress={() => setShowPassword(!showPassword)}
                                >
                                  <Feather
                                    name={!showPassword ? 'eye' : 'eye-off'}
                                    size={18}
                                    color="#9CA3AF"
                                  />
                                </TouchableOpacity>
                              )}
                            />
                          )}
                        />
                      </View>
                    </View>
                  </View>

                  <View className="mt-4 w-full flex-col gap-3">
                    <form.Subscribe
                      selector={state => [state.canSubmit, state.isSubmitting]}
                      children={([canSubmit, isSubmitting]) => {
                        const isDisabled = !canSubmit || isSubmitting;
                        return (
                          <Button
                            className={cn('my-1 h-12 w-full rounded-full p-0 shadow-sm', isDisabled
                              ? 'bg-[#A3E635]/50 dark:bg-[#A3E635]/50' // Màu khi Disable
                              : 'bg-[#A3E635] dark:bg-[#A3E635]')}
                            testID="login-button"
                            onPress={() => {
                              form.handleSubmit();
                            }}
                            disabled={isDisabled}
                            loading={isSubmitting}
                            textClassName={cn(
                              'text-base font-semibold',
                              isDisabled
                                ? 'text-[#0F0F0F] dark:text-[#0F0F0F]' // Chữ khi Disable
                                : 'text-[#0F0F0F] dark:text-[#0F0F0F]', // Chữ khi Active
                            )}
                            label={translate('formAuth.titleSignIn')}
                          />
                        );
                      }}
                    />

                    <TouchableOpacity
                      testID="reset-password"
                      onPress={() => router.back()}
                      activeOpacity={0.7}
                      className="h-12 w-full items-center justify-center rounded-full bg-[#E5E7EB] shadow-sm"
                    >
                      <Text
                        className="font-medium text-[#4B5563] dark:text-[#4B5563]"
                        tx="formAuth.resetPassword"
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="my-6 w-full flex-row items-center justify-center">
                    <View className="h-px flex-1 bg-black/10" />
                    <Text className="mx-4 text-neutral-500 dark:text-neutral-500" tx="formAuth.or" />
                    <View className="h-px flex-1 bg-black/10" />
                  </View>

                  <View className="mb-6 w-full flex-row justify-center gap-6">
                    <TouchableOpacity className="size-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-white">
                      <Fontisto name="google" size={20} color="#DB4437" />
                    </TouchableOpacity>
                    <TouchableOpacity className="size-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-white">
                      <Fontisto name="facebook" size={20} color="#4267B2" />
                    </TouchableOpacity>
                    <TouchableOpacity className="size-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-white">
                      <Fontisto name="apple" size={20} color="#000000" />
                    </TouchableOpacity>
                  </View>

                </View>
                <View className="w-full flex-row items-center justify-center gap-1">
                  <Text className="text-[#4B5563] dark:text-[#4B5563]">
                    {translate('formAuth.dontHaveAccount')}
                  </Text>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        router.push('/(welcome)/signUp');
                      }}
                    >
                      <Text className="font-bold text-[#A3E635] dark:text-[#A3E635]">
                        {translate('formAuth.titleSignUp')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
