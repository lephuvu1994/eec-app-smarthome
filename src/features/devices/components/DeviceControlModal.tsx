import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useUniwind } from 'uniwind';

import { Text, TouchableOpacity } from '@/components/ui';
import { isPrimaryFeature } from '@/lib/utils/device-feature-helper';
import { useDeviceModal } from '@/stores/device/device-modal-store';

export function DeviceControlModal() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { isOpen, activeDevice, activeFeature, closeModal } = useDeviceModal();
  const { theme } = useUniwind();

  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    }
    else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isOpen]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        closeModal();
      }
    },
    [closeModal],
  );

  const renderContent = () => {
    if (!activeDevice)
      return null;

    // 1. FLAT MODE FOCUS (Điều khiển 1 tính năng cụ thể + Các phụ kiện đính kèm tính năng đó)
    if (activeFeature) {
      return (
        <View className="mt-4 flex-1">
          <Text className="mb-1 text-xl font-bold text-neutral-900 dark:text-white">
            {activeDevice.name}
          </Text>
          <Text className="mb-6 text-sm font-medium text-neutral-500">
            Module:
            {' '}
            {activeFeature.name || activeFeature.code}
          </Text>

          {/* Placeholder cho điều khiển chuyên sâu */}
          <View className="h-32 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <Text className="text-neutral-500">
              [Khu vực Render Thanh trượt / Bảng Màu / Điều Hòa]
            </Text>
          </View>
        </View>
      );
    }

    // 2. GROUP MODE FOCUS (Xem toàn bộ thiết bị vật lý và điều khiển 4 nút thành phần)
    const primaryFeatures = activeDevice.features?.filter(isPrimaryFeature) ?? [];

    return (
      <View className="mt-4 flex-1">
        <Text className="mb-6 text-xl font-bold text-neutral-900 dark:text-white">
          {activeDevice.name}
        </Text>

        {/* eslint-disable-next-line style/multiline-ternary */}
        {primaryFeatures.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {primaryFeatures.map((f) => {
              const isOn = f.currentValue === 1; // Giả định
              return (
                <TouchableOpacity
                  key={f.id}
                  className={`h-24 min-w-[45%] flex-1 justify-between rounded-xl p-3 ${isOn ? 'bg-[#A3EC3E]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                  onPress={() => {
                    // TODO: Gọi API Toggle MQTT vào đây cho feature `f.code`
                    console.log('Toggle:', f.code);
                  }}
                >
                  <View className={`size-3 rounded-full ${isOn ? 'bg-white' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                  <Text
                    className={`text-lg font-semibold ${
                      isOn ? 'text-black' : 'text-neutral-800 dark:text-white'
                    }`}
                  >
                    {f.name || f.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text className="mt-10 text-center text-neutral-500">
            Thiết bị này chưa có tính năng điều khiển nào.
          </Text>
        )}
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['50%']}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: theme === 'dark' ? '#1c1c1c' : '#ffffff',
      }}
      handleIndicatorStyle={{
        backgroundColor: theme === 'dark' ? '#3a3a3a' : '#E5E5E5',
      }}
    >
      <BottomSheetView className="flex-1 px-5 pb-8">
        {renderContent()}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
