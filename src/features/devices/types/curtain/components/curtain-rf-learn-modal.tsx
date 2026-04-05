import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FontAwesome5 } from '@expo/vector-icons';
import * as React from 'react';
import { useUniwind } from 'uniwind';

import { Button, Modal, ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  isControlling: boolean;
  rfLearnStatus: string;
  setRfLearnStatus: (status: string) => void;
  onStartLearn: () => Promise<void>;
  onCancelLearn: () => Promise<void>;
  onSaveLearn: () => Promise<void>;
};

export function CurtainRfLearnModal({
  modalRef,
  isControlling,
  rfLearnStatus,
  setRfLearnStatus,
  onStartLearn,
  onCancelLearn,
  onSaveLearn,
}: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const isLearning = rfLearnStatus && rfLearnStatus !== 'success' && rfLearnStatus !== 'timeout' && rfLearnStatus !== 'cancelled';

  // Status tracker helper
  const hasStarted = !!rfLearnStatus && rfLearnStatus !== '';
  const isCanceledOrTimeout = rfLearnStatus === 'cancelled' || rfLearnStatus === 'timeout';
  const isSuccess = rfLearnStatus === 'success';

  const isStep1Done = rfLearnStatus === 'step_1_open' || rfLearnStatus === 'step_2_close' || rfLearnStatus === 'step_3_stop' || isSuccess;
  const isStep2Done = rfLearnStatus === 'step_2_close' || rfLearnStatus === 'step_3_stop' || isSuccess;
  const isStep3Done = rfLearnStatus === 'step_3_stop' || isSuccess;
  // Step 4 done if success (since we know the firmware handles 4th or 3rd to end the flow)

  const handleModalDismiss = () => {
    if (isLearning) {
      onCancelLearn();
    }
    setRfLearnStatus(''); // Reset UI state on close
  };

  const renderStep = (label: string, isDone: boolean, isActive: boolean) => {
    let iconName = 'circle';
    let iconColor = isDark ? '#52525B' : '#D4D4D8'; // Gray

    if (isDone) {
      iconName = 'check-circle';
      iconColor = '#A3E635'; // Lime green
    }
    else if (isActive) {
      iconName = 'dot-circle';
      iconColor = isDark ? '#EAB308' : '#CA8A04'; // Yellow active
    }

    return (
      <View className="flex-row items-center gap-3 py-2">
        <FontAwesome5 name={iconName} size={20} color={iconColor} solid={isDone} />
        <Text className={
          isDone
            ? 'text-base font-normal text-neutral-500 dark:text-neutral-400'
            : isActive
              ? 'text-base font-bold text-[#1B1B1B] dark:text-white'
              : 'text-base font-normal text-neutral-400 dark:text-neutral-500'
        }
        >
          {label}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      ref={modalRef}
      snapPoints={['50%']}
      title={translate('deviceDetail.shutter.advanced.rfLearning')}
      onDismiss={handleModalDismiss}
    >
      <ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">

          {!hasStarted && (
            <View className="items-center py-4">
              <Text className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Lưu ý: Quá trình học lệnh RF được kiểm soát tự động bởi thiết bị. Nhấn Bắt Đầu, sau đó lần lượt nhấn từng nút tương ứng trên Remote.
              </Text>
              <Button
                className="h-14 w-full bg-[#A3E635]"
                textClassName="text-[#1B1B1B] font-bold text-base"
                label="Bắt đầu Học RF"
                onPress={() => onStartLearn()}
                disabled={isControlling}
              />
            </View>
          )}

          {hasStarted && !isCanceledOrTimeout && !isSuccess && (
            <View className="py-2">
              <Text className="mb-4 text-sm font-semibold text-[#1B1B1B] dark:text-white">
                Tiến trình học lệnh:
              </Text>

              <View className="ml-2 gap-2 border-l border-neutral-200 pl-4 dark:border-neutral-700">
                {renderStep('1. Bấm nút MỞ trên Remote', isStep1Done, !isStep1Done)}
                {renderStep('2. Bấm nút ĐÓNG trên Remote', isStep2Done, isStep1Done && !isStep2Done)}
                {renderStep('3. Bấm nút DỪNG trên Remote', isStep3Done, isStep2Done && !isStep3Done)}
                {renderStep('4. Bấm nút KHOÁ trên Remote', isSuccess, isStep3Done && !isSuccess)}
              </View>

              <View className="mt-8 flex-row items-center justify-between gap-3">
                <Button
                  className="h-[52px] flex-1 bg-neutral-100 dark:bg-neutral-700"
                  textClassName="text-red-500 font-semibold"
                  label="Hủy quá trình"
                  onPress={() => onCancelLearn()}
                  disabled={isControlling}
                />

                {isStep3Done && !isSuccess && (
                  <Button
                    className="h-[52px] flex-1 bg-[#A3E635]"
                    textClassName="text-[#1B1B1B] font-semibold"
                    label="Hoàn tất & Lưu"
                    onPress={() => onSaveLearn()}
                    disabled={isControlling}
                  />
                )}
              </View>
            </View>
          )}

          {isSuccess && (
            <View className="items-center py-6">
              <FontAwesome5 name="check-circle" size={48} color="#A3E635" solid />
              <Text className="mt-4 text-center text-lg font-bold text-[#1B1B1B] dark:text-white">
                Đã Lưu Thành Công
              </Text>
              <Text className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Bộ lệnh từ Remote đã được thiết bị ghi nhận.
              </Text>
              <Button
                className="mt-4 h-14 w-full bg-[#A3E635]"
                textClassName="text-[#1B1B1B] font-bold text-base"
                label="Hoàn tất"
                onPress={() => modalRef.current?.dismiss()}
              />
            </View>
          )}

          {isCanceledOrTimeout && (
            <View className="items-center py-6">
              <FontAwesome5 name="times-circle" size={48} color="#EF4444" solid />
              <Text className="mt-4 text-center text-lg font-bold text-[#1B1B1B] dark:text-white">
                Đã Hủy Học / Hết Hạn
              </Text>
              <Text className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Bạn đã hủy quá trình học hoặc hết 30 giây rảnh tay. Vui lòng học lại từ đầu.
              </Text>
              <Button
                className="mt-6 h-14 w-full bg-neutral-100 dark:bg-neutral-700"
                textClassName="text-[#1B1B1B] font-bold text-base dark:text-white"
                label="Thử lại"
                onPress={() => {
                  setRfLearnStatus('');
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}
