import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useForm } from '@tanstack/react-form';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  .refine(data => data.password === data.repeatPassword, {
    path: ['repeatPassword'],
    message: 'Passwords do not match',
  });

export type FormType = z.infer<typeof schema>;

export type SignUpFormProps = {
  onSubmit?: (value: FormType) => Promise<void>;
};

export function SignUpForm({ onSubmit = async () => { } }: SignUpFormProps) {
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
  });
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={-120}
      className="absolute size-full justify-end"
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
            tint="dark"
            style={{ flex: 1 }}
            className="relative"
          >
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
            <View className="mt-4 flex-1">
              <Text
                testID="form-title"
                className="text-center text-3xl font-bold text-white"
              >
                {translate('base.signUp')}
              </Text>
              <View className="mx-4 mt-8 items-center gap-4">
                <View className="w-full gap-4">
                  <View className="w-full flex-row gap-2">
                    <View className="relative flex-1">
                      <form.Field
                        name="firstName"
                        children={field => (
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
                    <View className="relative flex-1">
                      <form.Field
                        name="lastName"
                        children={field => (
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
                  <View className="relative w-full">
                    <form.Field
                      name="identifier"
                      children={field => (
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

                  <View className="relative w-full">
                    <form.Field
                      name="password"
                      children={field => (
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
                  <View className="relative w-full">
                    <form.Field
                      name="repeatPassword"
                      validators={{
                        onChange: schema.shape.repeatPassword,
                      }}
                      children={field => (
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

                <View className="mt-4 w-full">
                  <form.Subscribe
                    selector={state => [state.isSubmitting]}
                    children={([isSubmitting]) => (
                      <Button
                        className="mb-3 w-full rounded-2xl bg-transparent p-0 dark:bg-transparent"
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
                <View className="mt-2 w-full items-center justify-center gap-2">
                  <Text className="text-white dark:text-white">
                    {translate('base.haveAccount')}
                  </Text>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        router.push('/(welcome)/login');
                      }}
                    >
                      <Text className="text-white underline dark:text-white">
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
}
