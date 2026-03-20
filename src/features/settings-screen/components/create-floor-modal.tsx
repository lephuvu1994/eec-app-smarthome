import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useUniwind } from 'uniwind';

import { Text, TouchableOpacity } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { useCreateFloor } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type CreateFloorModalProps = {
  homeId: string;
};

export function CreateFloorModal({ ref, homeId }: CreateFloorModalProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const createFloor = useCreateFloor(homeId);
  const [name, setName] = useState('');

  const dismiss = useCallback(() => {
    if (ref && 'current' in ref)
      ref.current?.dismiss();
  }, [ref]);

  const handleCreate = useCallback(() => {
    if (!name.trim())
      return;
    createFloor.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
          dismiss();
        },
      },
    );
  }, [name, createFloor, dismiss]);

  return (
    <Modal ref={ref} snapPoints={['35%']} title={translate('roomManagement.addFloor')}>
      <View className="flex-1 px-4 pt-2">
        <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {translate('roomManagement.floorName')}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={translate('roomManagement.floorNamePlaceholder')}
          placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
          className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-[#1B1B1B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!name.trim() || createFloor.isPending}
          activeOpacity={0.8}
          className="items-center rounded-xl bg-emerald-500 py-3.5 disabled:opacity-50"
        >
          <Text className="text-[15px] font-semibold text-white">
            {createFloor.isPending ? translate('base.loading') : translate('roomManagement.create')}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
