import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input, Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';

type SaveSceneSheetProps = {
  onSave: (name: string) => void;
  isCreating: boolean;
  initialName?: string;
};

export function SaveSceneSheet({ ref, onSave, isCreating, initialName }: SaveSceneSheetProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const { bottom } = useSafeAreaInsets();
  const [name, setName] = useState(initialName || '');

  React.useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName]);

  const handleSave = useCallback(() => {
    if (!name.trim())
      return;
    onSave(name.trim());
  }, [name, onSave]);

  return (
    <Modal ref={ref} snapPoints={['auto']}>
      <BottomSheetView
        style={{
          paddingBottom: Math.max(bottom, 24),
          paddingHorizontal: 24,
          paddingTop: 8,
        }}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-[#1B1B1B] dark:text-white">
            {translate('scenes.builder.nameLabel')}
          </Text>
        </View>

        <Input
          value={name}
          onChangeText={setName}
          placeholder={translate('scenes.builder.namePlaceholder')}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
          editable={!isCreating}
        />

        <Button
          label={translate('scenes.builder.save')}
          onPress={handleSave}
          disabled={!name.trim() || isCreating}
          loading={isCreating}
          className="bg-primary mt-6 h-14 rounded-2xl"
        />
      </BottomSheetView>
    </Modal>
  );
}

SaveSceneSheet.displayName = 'SaveSceneSheet';
