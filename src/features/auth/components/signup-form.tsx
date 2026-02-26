import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp } from 'react-native-reanimated';

import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as z from 'zod';

import {
  Button,
  FloatInput,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { translate } from '@/lib/i18n';
import { getFieldError } from '@/components/ui/form-utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const schema = z
  .object({
    firstName: z.string().trim().min(1, 'Nhập và tên đầy đủ'),
    lastName: z.string().trim().min(1, 'Nhập và tên đầy đủ'),
    identifier: z
      .string()
      .trim()
      .min(1, 'Email bắt buộc phải nhập')
      .pipe(z.email({ message: 'Không đúng định dạng email' })),
    password: z
      .string()
      .trim()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    repeatPassword: z
      .string()
      .trim()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords do not match',
  });

export type FormType = z.infer<typeof schema>;

export type SignUpFormProps = {
  onSubmit?: (value: FormType) => Promise<void>;
};

export const SignUpForm = ({ onSubmit = async () => { } }: SignUpFormProps) => {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      identifier: '',
      password: '',
      repeatPassword: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  })
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={-120}
      className="w-full h-full justify-end absolute"
    >
      <Animated.View
        entering={FadeInUp.delay(100)
          .duration(500)
          .withInitialValues({
            transform: [{ translateY: '50%' }],
            opacity: 0,
          })}
        className="w-full overflow-hidden rounded-t-[40px]"
        style={{
          shadowColor: '#222',
          shadowOffset: { width: 0, height: 32 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          elevation: 5,
          height: insets.bottom + 540,
        }}
      >
        <LinearGradient
          colors={['#2E335A', '#1C1B33']}
          style={{
            flex: 1,
            height: '100%',
            borderRadius: 40,
            overflow: 'hidden',
          }}
        >
          <BlurView
            intensity={20}
            tint={'dark'}
            style={{ flex: 1 }}
            className="relative"
          >
            <Image
              source={require('@@/assets/base/auro.png')}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                opacity: 1, // chỉnh độ mờ
              }}
              contentFit='cover'
            />
            <Image
              source={require('@@/assets/base/auro.png')}
              style={{
                position: 'absolute',
                transform: [{ rotate: '180deg' }],
                translateX: -120,
                translateY: -320,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                opacity: 1, // chỉnh độ mờ
              }}
              contentFit='cover'
            />
            <Image
              source={require('@@/assets/base/auro.png')}
              style={{
                position: 'absolute',
                transform: [{ rotate: '180deg' }],
                translateX: 80,
                translateY: 80,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                opacity: 1, // chỉnh độ mờ
              }}
              contentFit='cover'
            />
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.05)', // viền sáng bên trong
                'rgba(255,255,255,0)', // fade vào giữa
              ]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 40,

                // Trick để tạo inner glow
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',

                // Gradient inside
                padding: 2,
              }}
            />
            <View className="flex-1 mt-4">
              <Text
                testID="form-title"
                className="text-center text-white font-bold text-3xl"
              >
                {translate('base.signUp')}
              </Text>
              <View className="items-center mx-4 mt-8 gap-4">
                <View className="w-full gap-4">
                  <View className="w-full flex-row gap-2">
                    <View className="flex-1 relative">
                      <form.Field
                        name="firstName"
                        children={(field) => (
                          <FloatInput
                            testID="firstName-input"
                            inputClassName="text-white"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChangeText={field.handleChange}
                            label="Nhập tên"
                            error={getFieldError(field)}
                          />
                        )}
                      />
                    </View>
                    <View className="flex-1 relative">
                      <form.Field
                        name="lastName"
                        children={(field) => (
                          <FloatInput
                            value={field.state.value}
                            onChangeText={field.handleChange}
                            onBlur={field.handleBlur}
                            label="Nhập họ"
                            testID="lastName-input"
                            inputClassName="bg-transparent text-white dark:text-white"
                            placeholderTextColor="white"
                            error={getFieldError(field)}
                            rightIcon={<Fontisto name="email" size={18} color="white" />}
                          />
                        )}
                      />
                    </View>
                  </View>
                  <View className="w-full relative">
                    <form.Field
                      name="identifier"
                      children={(field) => (
                        <FloatInput
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          onBlur={field.handleBlur}
                          label="Nhập email hoặc số điện thoại"
                          testID="identifier"
                          inputClassName="bg-transparent text-white dark:text-white"
                          placeholderTextColor="white"
                          error={getFieldError(field)}
                          rightIcon={<Fontisto name="email" size={18} color="white" />}
                        />
                      )}
                    />
                  </View>

                  <View className="w-full relative">
                    <form.Field
                      name="password"
                      children={(field) => (
                        <FloatInput
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          onBlur={field.handleBlur}
                          testID="password-input"
                          label={translate('base.password')}
                          secureTextEntry={!showPassword}
                          inputClassName="bg-transparent text-white dark:text-white"
                          placeholderTextColor="white"
                          error={getFieldError(field)}
                          rightIcon={<TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}>
                            <Feather
                              name={!showPassword ? 'eye' : 'eye-off'}
                              size={18}
                              color="#d1d5db"
                            />
                          </TouchableOpacity>}
                        />
                      )}
                    />
                  </View>
                  <View className="w-full relative">
                    <form.Field
                      name="repeatPassword"
                      validators={{
                        onChange: schema.shape.repeatPassword,
                      }}
                      children={(field) => (
                        <FloatInput
                          value={field.state.value}
                          onChangeText={field.handleChange}
                          onBlur={field.handleBlur}
                          testID="password-input"
                          label={translate('base.repeatPassword')}
                          secureTextEntry={!showPassword}
                          inputClassName="bg-transparent text-white dark:text-white"
                          placeholderTextColor="white"
                          error={getFieldError(field)}
                          rightIcon={<TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}>
                            <Feather
                              name={!showPassword ? 'eye' : 'eye-off'}
                              size={18}
                              color="#d1d5db"
                            />
                          </TouchableOpacity>}
                        />
                      )}
                    />
                  </View>
                </View>

                <View className="w-full mt-4">
                  <form.Subscribe
                    selector={(state) => [state.isSubmitting]}
                    children={([isSubmitting]) => (
                      <Button
                        className="w-full p-0 bg-transparent dark:bg-transparent rounded-2xl mb-3"
                        testID="login-button"
                        onPress={form.handleSubmit}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        textClassName="text-black"
                      >
                        <LinearGradient
                          colors={[
                            'rgba(72,49,157,0.6)',
                            'rgba(72,49,157,0.8)',
                          ]}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 16,
                            alignItems: 'center',
                            justifyContent: 'center',

                            // Viền mờ giống figma (Stroke 20%)
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.25)',

                            // Shadow ngoài
                            shadowColor: '#000',
                            shadowOpacity: 0.25,
                            shadowRadius: 20,
                            shadowOffset: { width: 0, height: 5 },

                            backgroundColor: 'rgba(72,49,157,0.2)',
                          }}
                        >
                          <Text className="text-white">
                            {translate('base.signUp')}
                          </Text>
                        </LinearGradient>
                      </Button>
                    )}
                  />
                </View>
                <View className="w-full mt-2 gap-2 justify-center items-center">
                  <Text className="text-white dark:text-white">
                    {translate('base.haveAccount')}
                  </Text>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        router.push('/(welcome)/login');
                      }}
                    >
                      <Text className="text-white dark:text-white underline">
                        {translate('base.signIn')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};
