import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useForm } from '@tanstack/react-form';
import { BlurView } from 'expo-blur';
import { StyleSheet } from "react-native"

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp } from 'react-native-reanimated';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const schema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, translate("formAuth.error.identifierRequired"))
    .pipe(z.email({ message: translate("formAuth.error.invalidFormatIdentifier") })),
  password: z
    .string()
    .trim()
    .min(1, translate("formAuth.error.passwordRequired"))
    .min(6, translate("formAuth.error.passwordRequired", {
      length: 6
    })),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: (value: FormType) => Promise<void>;
};

export function LoginForm({ onSubmit = async () => { } }: LoginFormProps) {
  const { bottom } = useSafeAreaInsets()

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
          paddingBottom: bottom
        }}
      >
        <BlurView
          intensity={40}
          tint="light"
          style={{ ...StyleSheet.absoluteFillObject }}
          className="relative rounded-3xl overflow-hidden"
        >

          <View
            className="flex-1 rounded-3xl bg-white/70 border border-white/25"
          >
            <View className="mt-4 flex-1">
              <View className="mx-4 mt-6 items-center">
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
                            label={translate("formAuth.titleIdentifier")}
                            testID="identifier"
                            inputClassName="text-[#737373] dark:text-[#737373]"
                            containerClassName="bg-white shadow"
                            labelTextColor="#737373"
                            labelTextColorInactive="#C6C6C6"
                            placeholderTextColor="text-[#737373] dark:text-[#737373]"
                            borderColor={{
                              active: "#737373",
                              inactive: "#FFFFFF"
                            }}
                            error={getFieldError(field)}
                            rightIcon={<Fontisto name="email" size={18} color="#d1d5db" />}
                          />
                        )}
                      />
                    </View>
                  </View>

                  <View className="w-full gap-2">
                    <View className="relative mb-4 w-full">
                      <form.Field
                        name="password"
                        children={field => (
                          <FloatInput
                            value={field.state.value}
                            onChangeText={field.handleChange}
                            onBlur={field.handleBlur}
                            testID="password-input"
                            label={translate("formAuth.titlePassword")}
                            secureTextEntry={!showPassword}
                            inputClassName="text-neutral-500 dark:text-neutral-500"
                            containerClassName="bg-white shadow"
                            labelTextColor="#737373"
                            labelTextColorInactive="#C6C6C6"
                            borderColor={{
                              active: "#737373",
                              inactive: "#FFFFFF"
                            }}
                            placeholderTextColor="text-neutral-500 dark:text-neutral-500"
                            error={getFieldError(field)}
                            rightIcon={(
                              <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                              >
                                <Feather
                                  name={!showPassword ? 'eye' : 'eye-off'}
                                  size={18}
                                  color="#d1d5db"
                                />
                              </TouchableOpacity>
                            )}
                          />
                        )}
                      />
                    </View>
                  </View>
                </View>

                <View className="mt-4 w-full flex-col">
                  <form.Subscribe
                    selector={state => [state.isSubmitting]}
                    children={([isSubmitting]) => (
                      <Button
                        className="w-full my-1 h-12 rounded-full bg-[#A3EC3E] p-0 dark:bg-[#A3EC3E] shadow"
                        testID="login-button"
                        onPress={() => {
                          form.handleSubmit();
                        }}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        textClassName="text-[#0F0F0F] dark:text-[#0F0F0F]"
                        label={translate('base.loginLabel')}
                      />
                    )}
                  />

                  <View
                  className="w-full rounded-full"
                    style={{
                      // 1. OUTER SHADOW: 0 1px 2px 0 rgba(16, 24, 40, 0.05)
                      // Đặt ở View bọc ngoài cùng để đổ bóng ra ngoài
                      shadowColor: 'rgba(16, 24, 40, 1)',
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      shadowOffset: { width: 0, height: 1 },
                      elevation: 1, // Cho Android
                    }}
                  >
                    <TouchableOpacity
                      testID="reset-password"
                      onPress={() => router.back()}
                      activeOpacity={0.7}
                      className="h-12 rounded-full items-center justify-center overflow-hidden"
                      style={{
                        // 2. BACKGROUND & INNER BORDER 
                        // Set trực tiếp vào container, nó sẽ tự động thành Inset Border (viền bên trong)
                        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Chuẩn biến #000000 10% của bạn
                        borderWidth: 1,
                        borderColor: 'rgba(13, 18, 28, 0.18)', // Viền chuẩn theo Figma
                      }}
                    >
                      {/* 3. BOTTOM INSET SHADOW: 0 -2px 0 0 rgba(13, 18, 28, 0.05) inset */}
                      {/* Chỉ một dải màu mờ 2px nằm sát đáy để tạo độ nổi nhẹ */}
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 2, // Tương đương độ dày -2px
                          backgroundColor: 'rgba(13, 18, 28, 0.05)',
                        }}
                      />

                      <Text
                        className="text-neutral-500"
                        tx="formAuth.resetPassword"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="mt-2 w-full items-center justify-center gap-2">
                  <Text className="text-white dark:text-white">
                    {translate('base.dontHaveAccount')}
                  </Text>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        router.push('/(welcome)/signUp');
                      }}
                    >
                      <Text className="text-white underline dark:text-white">
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
