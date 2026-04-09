import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { HEIGHT, Modal, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  isControlling: boolean;
  onSelectDir: (dir: 'DIR_FWD' | 'DIR_REV') => void;
};

export function CurtainMotorDirModal({
  modalRef,
  isControlling,
  onSelectDir,
}: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const handleSelect = (dir: 'DIR_FWD' | 'DIR_REV') => {
    onSelectDir(dir);
    modalRef.current?.dismiss();
  };

  return (
    <Modal ref={modalRef} snapPoints={[insets.bottom + HEIGHT * 0.35]} title={translate('deviceDetail.shutter.advanced.motorDir')}>
      <View className="p-5 pb-10">
        <View className="rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-800">

          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl p-4"
            disabled={isControlling}
            onPress={() => handleSelect('DIR_FWD')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-4">
              <View className="items-center justify-center rounded-full bg-blue-100 p-2 dark:bg-blue-500/20">
                <MaterialCommunityIcons name="rotate-right" size={24} color="#3B82F6" />
              </View>
              <Text className="text-[17px] font-medium text-[#1B1B1B] dark:text-white">Quay thuận (Forward)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
          </TouchableOpacity>

          <View className="mx-4 h-px bg-neutral-100 dark:bg-neutral-700" />

          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl p-4"
            disabled={isControlling}
            onPress={() => handleSelect('DIR_REV')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-4">
              <View className="items-center justify-center rounded-full bg-red-100 p-2 dark:bg-red-500/20">
                <MaterialCommunityIcons name="rotate-left" size={24} color="#EF4444" />
              </View>
              <Text className="text-[17px] font-medium text-[#1B1B1B] dark:text-white">Quay ngược (Reverse)</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}
