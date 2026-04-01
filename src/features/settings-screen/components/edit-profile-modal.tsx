import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useState } from 'react';
import { useUniwind } from 'uniwind';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type EditProfileModalProps = {
  initialName?: string;
  isSaving?: boolean;
  onSave: (newName: string) => void;
};

export function EditProfileModal({
  ref,
  initialName = '',
  isSaving = false,
  onSave,
}: EditProfileModalProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const inputStyle = 'mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-[#1B1B1B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white';

  const handleSave = useCallback(() => {
    if (!name.trim() || name.trim() === initialName) {
      return;
    }
    onSave(name.trim());
  }, [name, initialName, onSave]);

  return (
    <Modal ref={ref} snapPoints={['40%']} title={translate('settings.editProfile' as any)}>
      <View className="flex-1 px-4 pt-2">
        <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {translate('formAuth.fullName')}
        </Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder={translate('settings.defaultUser')}
          placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
          className={inputStyle}
          editable={!isSaving}
        />

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!name.trim() || name.trim() === initialName || isSaving}
          activeOpacity={0.8}
          className="mt-2 items-center rounded-xl bg-emerald-500 py-3.5 disabled:opacity-50"
        >
          <Text className="text-[15px] font-semibold text-white">
            {isSaving ? translate('base.loading' as any) : translate('base.save' as any)}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
