import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeInRight, FadeInUp, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as z from 'zod';
import {
  Button,
  FloatInput,
  IS_IOS,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { emailRegex, phoneRegex } from '../utils/constants';
import { ResendOtpButton } from './resend-button';

// 1. Cập nhật Schema: Bổ sung thêm trường OTP
const schema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(1, translate('formAuth.error.identifierRequired'))
      // Thay đổi: Dùng refine để check 1 trong 2 điều kiện
      .refine(
        val => emailRegex.test(val) || phoneRegex.test(val),
        { message: translate('formAuth.error.invalidFormatIdentifier') },
      ),
    otp: z.string().optional(), // Tạm thời optional để Form không báo lỗi ở bước 1
    password: z
      .string()
      .trim()
      .min(1, translate('formAuth.error.passwordRequired'))
      .min(6, translate('formAuth.error.passwordInvalidFormat'))
      .optional(),
    repeatPassword: z.string().trim().optional(),
  })
  .refine((data) => {
    // Chỉ check match password nếu cả 2 đã được nhập
    if (data.password && data.repeatPassword) {
      return data.password === data.repeatPassword;
    }
    return true;
  }, {
    path: ['repeatPassword'],
    message: translate('formAuth.error.passwordNotMatch'),
  });

export type FormType = z.infer<typeof schema>;

// Tạo component AnimatedTextInput

export function SignUpForm() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // 2. Khởi tạo State Machine quản lý Bước
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const form = useForm({
    defaultValues: {
      identifier: '',
      otp: '',
      password: '',
      repeatPassword: '',
    },
    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      // Gọi API đăng ký thực tế ở đây
      _signUp(value);
    },
  });

  const identifierValue = form.getFieldValue('identifier');
  const isEmail = identifierValue.includes('@');

  const { mutate: _signUp } = useMutation({
    mutationFn: async (variables: any) => {
      // Mock API Call
      // const resultData = await client.post<UserResponse>('/auth/signup', variables);
      // return resultData.data;
      console.log('ĐĂNG KÝ THÀNH CÔNG VỚI DATA:', variables);
    },
  });

  // Giả lập API Gửi OTP
  const handleSendOTP = async () => {
    // TODO: Call API send OTP here
    setStep(2);
  };

  // Giả lập API Xác nhận OTP
  const handleVerifyOTP = async () => {
    // TODO: Call API verify OTP here
    setStep(3);
  };

  return (
    <KeyboardAvoidingView
      behavior={IS_IOS ? 'padding' : 'height'}
      keyboardVerticalOffset={-120}
      className="absolute size-full justify-end px-4"
    >
      <Animated.View
        entering={FadeInUp.delay(100).duration(500).withInitialValues({
          transform: [{ translateY: '50%' }],
          opacity: 0,
        })}
        className="w-full overflow-hidden"
        style={{
          height: 520 + bottom,
          marginBottom: bottom,
        }}
      >
        <BlurView
          intensity={40}
          tint="light"
          style={{ ...StyleSheet.absoluteFillObject }}
          className="relative overflow-hidden rounded-3xl"
        >
          <View className="flex-1 rounded-3xl border border-white/25 bg-white/70">
            <View className="flex-1 py-6">

              {/* === HEADER CÓ NÚT BACK === */}
              <View className="relative mb-6 w-full flex-row items-center justify-center px-4">
                {step > 1 && (
                  <TouchableOpacity
                    className="absolute left-4 p-2"
                    onPress={() => setStep(prev => (prev - 1) as 1 | 2 | 3)}
                  >
                    <Feather name="arrow-left" size={24} color="#1B1B1B" />
                  </TouchableOpacity>
                )}
                <Text className="text-2xl font-bold text-[#1B1B1B]">
                  {step === 1
                    ? translate('formAuth.titleSignIn')
                    : step === 2
                      ? translate('formAuth.verifyIdentifier', {
                          identifier: isEmail ? translate('formAuth.emailTitle') : translate('formAuth.phoneNumber'),
                        })
                      : translate('formAuth.createPassword')}
                </Text>
              </View>

              {/* === BƯỚC 1: NHẬP EMAIL === */}
              {step === 1 && (
                <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="flex-1 justify-between px-4">
                  <View className="w-full gap-4">
                    <form.Field
                      name="identifier"
                      children={(field) => {
                        const hasError = field.state.meta.errors.length > 0;
                        return (
                          <View className="relative w-full">
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
                            <Button
                              className={cn('mt-4 h-12 w-full rounded-full p-0 shadow-sm', (!field.state.value || hasError)
                                ? 'bg-[#A3E635]/50'
                                : 'bg-[#A3E635]')}
                              onPress={handleSendOTP}
                              disabled={!field.state.value || hasError}
                              textClassName="text-base font-semibold text-[#0F0F0F]"
                              label={translate('formAuth.titleSignUp')}
                            />
                          </View>
                        );
                      }}
                    />

                    <View className="my-2 w-full flex-row items-center justify-center">
                      <View className="h-px flex-1 bg-black/10" />
                      <Text className="mx-4 text-neutral-500" tx="formAuth.or" />
                      <View className="h-px flex-1 bg-black/10" />
                    </View>

                    <View className="w-full flex-row justify-center gap-6">
                      <TouchableOpacity className="size-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <Fontisto name="google" size={20} color="#DB4437" />
                      </TouchableOpacity>
                      <TouchableOpacity className="size-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <Fontisto name="facebook" size={20} color="#4267B2" />
                      </TouchableOpacity>
                      <TouchableOpacity className="size-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <Fontisto name="apple" size={20} color="#000000" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mb-4 w-full flex-row items-center justify-center gap-1">
                    <Text className="text-[#4B5563]">{translate('formAuth.haveAccount')}</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                      <Text className="font-bold text-[#A3E635]">{translate('formAuth.titleSignIn')}</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* === BƯỚC 2: NHẬP OTP === */}
              {step === 2 && (
                <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="flex-1 px-4">
                  <Text
                    className="mb-6 text-center text-[#4B5563]"
                  >
                    {translate('formAuth.messageDescriptionOtp', {
                      identifier: isEmail ? (`${translate('formAuth.emailTitle')} address`) : translate('formAuth.phoneNumber'),
                    })}
                  </Text>

                  <form.Field
                    name="otp"
                    children={field => (
                      <View className="w-full items-center">
                        {/* THỦ THUẬT: Khung UI 4 ô vuông */}
                        <View className="mb-6 w-[80%] flex-row justify-between">
                          {[0, 1, 2, 3].map((index) => {
                            const char = field.state.value[index];
                            return (
                              <View
                                key={index}
                                className={cn(
                                  'h-14 w-14 items-center justify-center rounded-xl border bg-white shadow-sm',
                                  char ? 'border-[#A3E635]' : 'border-transparent',
                                )}
                              >
                                <Text className="text-2xl font-bold text-[#1B1B1B]">
                                  {char || ''}
                                </Text>
                              </View>
                            );
                          })}
                        </View>

                        {/* THỦ THUẬT: TextInput ẩn nằm đè lên để hứng sự kiện bàn phím */}
                        <TextInput
                          value={field.state.value}
                          onChangeText={(val) => {
                            // Chỉ cho nhập số, tối đa 4 ký tự
                            const formatted = val.replace(/\D/g, '');
                            field.handleChange(formatted);
                            // Auto submit nếu đủ 4 số
                            if (formatted.length === 4) {
                              handleVerifyOTP();
                            }
                          }}
                          maxLength={4}
                          keyboardType="number-pad"
                          className="absolute h-14 w-[80%] opacity-0"
                          autoFocus
                        />

                        <Button
                          className={cn('h-12 w-full rounded-full p-0 shadow-sm', field.state.value.length !== 4
                            ? 'bg-[#DE1E23]/50' // Design của bạn để nút OTP màu đỏ, tôi dùng mã màu đỏ ví dụ
                            : 'bg-[#DE1E23]')}
                          onPress={handleVerifyOTP}
                          disabled={field.state.value.length !== 4}
                          textClassName="text-base font-semibold text-white"
                          label={translate('formAuth.verifyCode')}
                        />

                        <ResendOtpButton onResend={handleSendOTP} />
                      </View>
                    )}
                  />
                </Animated.View>
              )}

              {/* === BƯỚC 3: TẠO MẬT KHẨU === */}
              {step === 3 && (
                <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="flex-1 justify-between px-4">
                  <View className="w-full gap-4">
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
                    <form.Field
                      name="repeatPassword"
                      children={field => (
                        <FloatInput
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          onBlur={field.handleBlur}
                          testID="repeat-password-input"
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

                  <form.Subscribe
                    selector={state => ({
                      canSubmit: state.canSubmit,
                      isSubmitting: state.isSubmitting,
                      values: state.values,
                    })}
                    children={({ canSubmit, isSubmitting, values }) => {
                      const isDisabled = !canSubmit || isSubmitting || !values?.password || !values.repeatPassword;
                      return (
                        <Button
                          className={cn('my-4 h-12 w-full rounded-full p-0 shadow-sm', isDisabled
                            ? 'bg-[#A3E635]/50 dark:bg-[#A3E635]/50'
                            : 'bg-[#A3E635] dark:bg-[#A3E635]')}
                          onPress={() => form.handleSubmit()}
                          disabled={isDisabled}
                          loading={isSubmitting}
                          textClassName="text-base font-semibold text-[#0F0F0F] dark:text-[#0F0F0F]"
                          label={translate('formAuth.titleSignUp')}
                        />
                      );
                    }}
                  />
                </Animated.View>
              )}

            </View>
          </View>
        </BlurView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
