import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { TDeviceSelectionMode } from './device-selection-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';

import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';

type SaveSceneSheetProps = {
  onSelectMode: (mode: TDeviceSelectionMode) => void;
};

export function SelectModeDeviceSheet({ ref, onSelectMode }: SaveSceneSheetProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal ref={ref} snapPoints={[bottom + 200]}>
      <BottomSheetView
        style={{
          paddingBottom: Math.max(bottom, 24),
          paddingHorizontal: 24,
          paddingTop: 8,
        }}
      >
        <View className="mt-4 w-full flex-col items-center gap-2">
          <Pressable
            onPress={() => onSelectMode('single')}
            className="mb-2 w-full flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm active:opacity-70 dark:bg-white/10"
          >
            <View className="size-11 items-center justify-center rounded-xl bg-[#D1FAE5]">
              <MaterialCommunityIcons name="toggle-switch-outline" size={22} color="#10B981" />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
              {translate('scenes.builder.device.single')}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={() => onSelectMode('multi')}
            className="mb-2 w-full flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm active:opacity-70 dark:bg-white/10"
          >
            <View className="size-11 items-center justify-center rounded-xl bg-[#DBEAFE]">
              <MaterialCommunityIcons name="format-list-checks" size={22} color="#3B82F6" />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
              {translate('scenes.builder.device.multi')}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>
        </View>
      </BottomSheetView>
    </Modal>
  );
}

SelectModeDeviceSheet.displayName = 'SelectModeDeviceSheet';
