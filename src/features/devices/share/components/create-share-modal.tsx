import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { ActivityIndicator, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { showErrorMessage, showSuccessMessage } from '@/components/ui/utils';
import { useAddDeviceShare, useCreateDeviceShareToken } from '@/hooks/use-devices';
import { ESharePermission } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';

export type CreateShareModalRef = {
  present: () => void;
  dismiss: () => void;
};

type CreateShareModalProps = {
  deviceId: string;
  onSuccess?: () => void;
};

export function CreateShareModal({ ref, deviceId, onSuccess }: CreateShareModalProps & { ref?: React.RefObject<CreateShareModalRef | null> }) {
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetUserInput, setTargetUserInput] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // For sliding animation
  const slideAnim = useSharedValue(0);

  const { mutate: addShare, isPending } = useAddDeviceShare(deviceId);
  const { mutate: createToken, isPending: isTokenPending } = useCreateDeviceShareToken(deviceId);

  // Provide imperative ref
  React.useImperativeHandle(ref, () => ({
    present: () => {
      setStep(1);
      setTargetUserInput('');
      slideAnim.value = 0;
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  const snapPoints = useMemo(() => ['45%'], []);

  const handleSelectAccount = useCallback(() => {
    setStep(2);
    // eslint-disable-next-line react-hooks/immutability
    slideAnim.value = withTiming(-100, { duration: 300 });
  }, [slideAnim]);

  const handleBackStep = useCallback(() => {
    setStep(1);
    Keyboard.dismiss();
    // eslint-disable-next-line react-hooks/immutability
    slideAnim.value = withTiming(0, { duration: 300 });
  }, [slideAnim]);

  const handleGenerateLink = useCallback(() => {
    setStep(3);
    // eslint-disable-next-line react-hooks/immutability
    slideAnim.value = withTiming(-200, { duration: 300 });

    if (!generatedLink && !isTokenPending) {
      createToken(ESharePermission.EDITOR, {
        onSuccess: (data) => {
          // Creates a deep link like smarthome://share?token=abc
          const link = Linking.createURL('share', { queryParams: { token: data.token } });
          setGeneratedLink(link);
        },
        onError: () => {
          showErrorMessage(translate('base.somethingWentWrong'));
          handleBackStep();
        },
      });
    }
  }, [slideAnim, createToken, generatedLink, isTokenPending, handleBackStep]);

  const handleCopyLink = useCallback(async () => {
    await Clipboard.setStringAsync(generatedLink);
    showSuccessMessage(translate('base.success') as string);
  }, [generatedLink]);

  const handleSubmit = useCallback(() => {
    if (!targetUserInput.trim() || isPending)
      return;
    Keyboard.dismiss();
    addShare(
      { targetUser: targetUserInput.trim() },
      {
        onSuccess: () => {
          bottomSheetModalRef.current?.dismiss();
          onSuccess?.();
        },
        onError: () => {
          showErrorMessage(translate('base.somethingWentWrong'));
        },
      },
    );
  }, [targetUserInput, isPending, addShare, onSuccess]);

  const slide1Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${slideAnim.value}%` }],
      opacity: slideAnim.value === -100 ? 0 : 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
  });

  const slide2Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${slideAnim.value + 100}%` }],
      opacity: slideAnim.value === 0 ? 0 : 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
  });

  const slide3Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${slideAnim.value + 200}%` }],
      opacity: slideAnim.value === -200 ? 1 : 0,
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
  });

  // Content container wrapper for the overflow
  return (
    <Modal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
    >
      <View className="relative w-full flex-1 overflow-hidden pb-10">

        {/* SLIDE 1: Selection */}
        <Animated.View style={slide1Style} className="px-5 pt-4">
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
              className="flex-row items-center border-b border-neutral-200 p-4 dark:border-neutral-700"
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

        {/* SLIDE 2: Input */}
        <Animated.View style={slide2Style} className="flex-col px-5 pt-4">
          <View className="mb-6 flex-row items-center">
            <TouchableOpacity onPress={handleBackStep} className="mr-3 p-1">
              <MaterialCommunityIcons name="chevron-left" size={28} color={isDark ? '#FFF' : '#1B1B1B'} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-neutral-900 dark:text-white">
              {translate('deviceShare.viaAccount')}
            </Text>
          </View>

          <Text className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
            {translate('deviceShare.targetUserInput')}
          </Text>

          <TextInput
            value={targetUserInput}
            onChangeText={setTargetUserInput}
            autoCapitalize="none"
            autoComplete="off"
            autoFocus={step === 2}
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
              ? (
                  <ActivityIndicator color="white" />
                )
              : (
                  <Text className="font-semibold text-white">
                    {translate('deviceShare.submit')}
                  </Text>
                )}
          </Button>
        </Animated.View>

        {/* SLIDE 3: QR Code and Link */}
        <Animated.View style={slide3Style} className="flex-col px-5 pt-4" pointerEvents={step === 3 ? 'auto' : 'none'}>
          <View className="mb-6 flex-row items-center">
            <TouchableOpacity onPress={handleBackStep} className="mr-3 p-1">
              <MaterialCommunityIcons name="chevron-left" size={28} color={isDark ? '#FFF' : '#1B1B1B'} />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-neutral-900 dark:text-white">
              {translate('deviceShare.viaQrCode')}
            </Text>
          </View>

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
                      size={180}
                      color="#000000"
                      backgroundColor="#FFFFFF"
                    />
                  </View>

                  <Text className="mb-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    {translate('deviceShare.qrExpiryNotice') || 'This QR Code expires in 24 hours.'}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCopyLink}
                    className="flex-row items-center space-x-2 rounded-xl bg-blue-50 px-6 py-3 dark:bg-blue-900/30"
                  >
                    <MaterialCommunityIcons name="content-copy" size={20} color={isDark ? '#93c5fd' : '#2563eb'} />
                    <Text className="ml-2 font-medium text-blue-600 dark:text-blue-300">
                      {translate('deviceShare.copyLink') || 'Copy Link'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
        </Animated.View>

      </View>
    </Modal>
  );
}
