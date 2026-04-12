import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { Platform, TextInput } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { KeyboardAvoidingView, KeyboardController } from 'react-native-keyboard-controller';
import QRCode from 'react-native-qrcode-svg';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';

import { ActivityIndicator, Button, IS_IOS, showErrorMessage, showSuccessMessage, Text, TouchableOpacity, View } from '@/components/ui';
import { useAddDeviceShare, useCreateDeviceShareToken } from '@/hooks/use-devices';
import { translate } from '@/lib/i18n';
import { ESharePermission } from '@/types/device';

type Props = {
  deviceId: string;
};

export function CreateShareScreen({ deviceId }: Props) {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetUserInput, setTargetUserInput] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const { mutate: addShare, isPending } = useAddDeviceShare(deviceId);
  const { mutate: createToken, isPending: isTokenPending } = useCreateDeviceShareToken(deviceId);

  const handleSelectAccount = useCallback(() => {
    setStep(2);
  }, []);

  const handleBackStep = useCallback(() => {
    KeyboardController.dismiss();
    setStep(1);
  }, []);

  const handleCustomBackUrl = useCallback(() => {
    if (step > 1) {
      handleBackStep();
    }
    else {
      router.back();
    }
  }, [step, handleBackStep, router]);

  const handleGenerateLink = useCallback(() => {
    setStep(3);
    if (!generatedLink && !isTokenPending) {
      createToken(ESharePermission.EDITOR, {
        onSuccess: (data) => {
          const link = Linking.createURL('share', { queryParams: { token: data.token } });
          setGeneratedLink(link);
        },
        onError: () => {
          showErrorMessage(translate('base.somethingWentWrong'));
          setStep(1);
        },
      });
    }
  }, [createToken, generatedLink, isTokenPending]);

  const handleCopyLink = useCallback(async () => {
    await Clipboard.setStringAsync(generatedLink);
    showSuccessMessage(translate('base.success') as string);
  }, [generatedLink]);

  const handleSubmit = useCallback(() => {
    if (!targetUserInput.trim() || isPending)
      return;
    KeyboardController.dismiss();
    addShare(
      { targetUser: targetUserInput.trim() },
      {
        onSuccess: () => {
          showSuccessMessage(translate('base.success') as string);
          router.back();
        },
        onError: () => {
          showErrorMessage(translate('base.somethingWentWrong'));
        },
      },
    );
  }, [targetUserInput, isPending, addShare, router]);

  return (
    <BaseLayout>
      <KeyboardAvoidingView
        behavior={IS_IOS ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
        className="relative w-full flex-1"
      >
        <CustomHeader
          title={translate('deviceShare.addFirstShare') as string}
          tintColor={isDark ? '#FFF' : '#1B1B1B'}
          disableSafeArea={true}
          leftContent={(
            <HeaderIconButton onPress={handleCustomBackUrl}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={isDark ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
        />

        <View style={{ paddingTop: Platform.OS === 'ios' ? 76 : top + 64 }} className="flex-1 px-5">
          {/* SLIDE 1: Selection */}
          {step === 1 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="w-full">
              <Text className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
                {translate('deviceShare.shareMethod')}
              </Text>

              <View className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center border-b border-neutral-200 p-4 dark:border-neutral-700"
                  onPress={handleSelectAccount}
                >
                  <View className="mr-3 size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <MaterialCommunityIcons name="account-outline" size={24} color={isDark ? '#93c5fd' : '#2563eb'} />
                  </View>
                  <Text className="flex-1 text-base font-medium text-neutral-800 dark:text-neutral-200">
                    {translate('deviceShare.viaAccount')}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#737373' : '#a3a3a3'} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center p-4"
                  onPress={handleGenerateLink}
                >
                  <View className="mr-3 size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <MaterialCommunityIcons name="qrcode-scan" size={20} color={isDark ? '#93c5fd' : '#2563eb'} />
                  </View>
                  <Text className="flex-1 text-base font-medium text-neutral-800 dark:text-neutral-200">
                    {translate('deviceShare.viaQrCode')}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={isDark ? '#737373' : '#a3a3a3'} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* SLIDE 2: Input */}
          {step === 2 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="w-full">
              <Text className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {translate('deviceShare.viaAccount')}
              </Text>
              <Text className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                {translate('deviceShare.targetUserInput')}
              </Text>

              <TextInput
                value={targetUserInput}
                onChangeText={setTargetUserInput}
                autoCapitalize="none"
                autoComplete="off"
                autoFocus
                placeholder="user@example.com / 098xxxxxxx"
                placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
                className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                onSubmitEditing={handleSubmit}
              />

              <Button
                size="default"
                onPress={handleSubmit}
                disabled={isPending || !targetUserInput.trim()}
                className="w-full flex-row"
              >
                {isPending
                  ? <ActivityIndicator color="white" />
                  : <Text className="font-semibold text-white">{translate('deviceShare.submit')}</Text>}
              </Button>
            </Animated.View>
          )}

          {/* SLIDE 3: QR Code and Link */}
          {step === 3 && (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="w-full">
              <Text className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
                {translate('deviceShare.viaQrCode')}
              </Text>

              {isTokenPending || !generatedLink
                ? (
                    <View className="items-center py-10">
                      <ActivityIndicator size="large" color={isDark ? '#FFF' : '#2563eb'} />
                      <Text className="mt-4 text-neutral-500 dark:text-neutral-400">
                        {translate('base.loading')}
                        ...
                      </Text>
                    </View>
                  )
                : (
                    <View className="items-center">
                      <View className="mb-6 rounded-2xl bg-white p-3 shadow-sm">
                        <QRCode
                          value={generatedLink}
                          size={220}
                          color="#000000"
                          backgroundColor="#FFFFFF"
                        />
                      </View>

                      <Text className="mb-6 text-center text-base text-neutral-500 dark:text-neutral-400">
                        {translate('deviceShare.qrExpiryNotice') || 'This QR Code expires in 24 hours.'}
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleCopyLink}
                        className="w-[80%] flex-row items-center justify-center space-x-2 rounded-xl bg-blue-50 px-6 py-4 dark:bg-blue-900/30"
                      >
                        <MaterialCommunityIcons name="content-copy" size={24} color={isDark ? '#93c5fd' : '#2563eb'} />
                        <Text className="ml-3 text-lg font-medium text-blue-600 dark:text-blue-300">
                          {translate('deviceShare.copyLink') || 'Copy Link'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
      <FlashMessage position="top" />
    </BaseLayout>
  );
}
