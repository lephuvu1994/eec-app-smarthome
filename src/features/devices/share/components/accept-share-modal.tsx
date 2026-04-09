import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useEffect, useRef } from 'react';

import { useUniwind } from 'uniwind';
import { ActivityIndicator, Button, Modal, showErrorMessage, showSuccessMessage, Text, View } from '@/components/ui';
import { useAcceptDeviceShareToken, useDevices, useShareTokenPreview } from '@/hooks/use-devices';
import { translate } from '@/lib/i18n';

type AcceptShareModalProps = {
  token: string | null;
  onClose: () => void;
};

export function AcceptShareModal({ token, onClose }: AcceptShareModalProps) {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';
  const modalRef = useRef<BottomSheetModal>(null);

  const { data: preview, isLoading: isPreviewLoading, isError: isPreviewError } = useShareTokenPreview(token || '', !!token);
  const { mutate: acceptToken, isPending: isAccepting } = useAcceptDeviceShareToken();
  const { refetch: refetchDevices } = useDevices();

  // Open modal automatically when token changes
  useEffect(() => {
    if (token) {
      modalRef.current?.present();
    }
    else {
      modalRef.current?.dismiss();
    }
  }, [token]);

  const handleDismiss = () => {
    modalRef.current?.dismiss();
    onClose();
  };

  const handleAccept = () => {
    if (!token)
      return;
    acceptToken(token, {
      onSuccess: () => {
        showSuccessMessage(translate('deviceShare.successAdd') as string);
        refetchDevices();
        handleDismiss();
      },
      onError: () => {
        showErrorMessage();
      },
    });
  };

  return (
    <Modal
      ref={modalRef}
      snapPoints={['40%']}
      title={translate('deviceShare.shareTitle') as string}
      onDismiss={onClose}
    >
      <View className="flex-1 px-5 pt-4">
        {isPreviewLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#FFF' : '#000'} />
            <Text className="mt-4 text-neutral-500 dark:text-neutral-400">
              {translate('base.loading') as string}
            </Text>
          </View>
        )}

        {isPreviewError && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-lg font-medium text-red-500">
              {translate('deviceShare.linkExpiredOrInvalid') || 'Link expired or invalid'}
            </Text>
            <Button className="mt-6 w-full" variant="outline" onPress={handleDismiss}>
              <Text>{translate('base.cancel') as string}</Text>
            </Button>
          </View>
        )}

        {preview && !isPreviewLoading && !isPreviewError && (
          <View className="flex-1 justify-between pb-8">
            <View className="items-center">
              <View className="mb-4 size-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Text className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {preview.ownerName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text className="mb-2 text-center text-lg font-semibold text-neutral-900 dark:text-white">
                {preview.ownerName}
              </Text>

              <Text className="mb-6 text-center text-base text-neutral-500 dark:text-neutral-400">
                {(translate('deviceShare.wantsToShare') || 'Wants to share device with you:')}
                {'\n'}
                <Text className="font-bold text-neutral-800 dark:text-neutral-200">
                  {preview.deviceName}
                </Text>
              </Text>
            </View>

            <View className="flex-row items-center space-x-4">
              <Button
                variant="outline"
                onPress={handleDismiss}
                className="flex-1"
                disabled={isAccepting}
              >
                <Text className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {translate('base.cancel') as string}
                </Text>
              </Button>
              <View className="w-4" />
              <Button
                onPress={handleAccept}
                className="flex-1 flex-row"
                disabled={isAccepting}
              >
                {isAccepting
                  ? (
                      <ActivityIndicator color="white" />
                    )
                  : (
                      <Text className="font-semibold text-white">
                        {translate('deviceShare.accept') || 'Accept'}
                      </Text>
                    )}
              </Button>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
