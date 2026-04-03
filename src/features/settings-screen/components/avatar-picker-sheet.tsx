import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useUniwind } from 'uniwind';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type AvatarPickerSheetProps = {
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
};

export function AvatarPickerSheet({
  ref,
  onSelectCamera,
  onSelectLibrary,
}: AvatarPickerSheetProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const iconColor = isDark ? '#FFFFFF' : '#1B1B1B';

  const handleCamera = () => {
    ref?.current?.dismiss();
    onSelectCamera();
  };

  const handleLibrary = () => {
    ref?.current?.dismiss();
    onSelectLibrary();
  };

  return (
    <Modal ref={ref} snapPoints={['25%']} title={translate('settings.editProfile' as TxKeyPath)}>
      <View className="flex-1 px-4 pt-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCamera}
          className="mb-3 flex-row items-center gap-4 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800"
        >
          <MaterialCommunityIcons name="camera-outline" size={24} color={iconColor} />
          <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">
            {translate('settings.camera' as TxKeyPath)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLibrary}
          className="flex-row items-center gap-4 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800"
        >
          <MaterialCommunityIcons name="image-outline" size={24} color={iconColor} />
          <Text className="text-[15px] font-medium text-[#1B1B1B] dark:text-white">
            {translate('settings.library' as TxKeyPath)}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
