import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useCallback, useState } from 'react';
import { useUniwind } from 'uniwind';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { useCreateRoom } from '@/hooks/use-homes';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

type CreateRoomModalProps = {
  homeId: string;
  floorId?: string;
};

export function CreateRoomModal({ ref, homeId, floorId }: CreateRoomModalProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const createRoom = useCreateRoom(homeId);
  const [name, setName] = useState('');
  const [cameraLink, setCameraLink] = useState('');

  const inputStyle = 'mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] text-[#1B1B1B] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white';

  const dismiss = useCallback(() => {
    if (ref && 'current' in ref)
      ref.current?.dismiss();
  }, [ref]);

  const handleCreate = useCallback(() => {
    if (!name.trim())
      return;
    createRoom.mutate(
      { name: name.trim(), floorId },
      {
        onSuccess: () => {
          setName('');
          setCameraLink('');
          dismiss();
        },
      },
    );
  }, [name, floorId, createRoom, dismiss]);

  return (
    <Modal ref={ref} snapPoints={['55%']} title={translate('roomManagement.addRoom')}>
      <View className="flex-1 px-4 pt-2">
        {/* Room name */}
        <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {translate('roomManagement.roomName')}
        </Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder={translate('roomManagement.roomNamePlaceholder')}
          placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
          className={inputStyle}
        />

        {/* Camera link (UI ready, API pending) */}
        <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {translate('roomManagement.cameraLink')}
        </Text>
        <BottomSheetTextInput
          value={cameraLink}
          onChangeText={setCameraLink}
          placeholder="rtsp://..."
          placeholderTextColor={isDark ? '#737373' : '#A3A3A3'}
          className={inputStyle}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Image upload placeholder (API pending) */}
        <Text className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {translate('roomManagement.image')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          className="mb-4 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-4 dark:border-neutral-600 dark:bg-neutral-800"
        >
          <Text className="text-sm text-neutral-400 dark:text-neutral-500">
            +
            {' '}
            {translate('roomManagement.image')}
          </Text>
        </TouchableOpacity>

        {/* Create button */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!name.trim() || createRoom.isPending}
          activeOpacity={0.8}
          className="items-center rounded-xl bg-emerald-500 py-3.5 disabled:opacity-50"
        >
          <Text className="text-[15px] font-semibold text-white">
            {createRoom.isPending ? translate('base.loading') : translate('roomManagement.create')}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
