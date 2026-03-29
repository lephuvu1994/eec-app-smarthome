import type { TxKeyPath } from '@/lib/i18n';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components/ui';
import { translate } from '@/lib/i18n';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (newName: string) => Promise<void>;
};

export function RenameDeviceModal({ isVisible, onClose, currentName, onSave }: Props) {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setName(currentName);
        setIsSaving(false);
      }, 0);
    }
  }, [isVisible, currentName]);

  const handleSave = async () => {
    if (!name.trim() || name.trim() === currentName) {
      onClose();
      return;
    }
    try {
      setIsSaving(true);
      await onSave(name.trim());
      onClose();
    }
    catch {
      // ignore or show toast
    }
    finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center bg-black/50 px-6">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800">
            <Text className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">
              {(translate('deviceDetail.shutter.rename' as TxKeyPath) || 'Đổi tên thiết bị') as string}
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={(translate('deviceDetail.shutter.defaultName' as TxKeyPath) || 'Tên thiết bị') as string}
              placeholderTextColor="#9CA3AF"
              className="mt-2 border-b-2 border-blue-500 py-3 text-base text-neutral-900 dark:text-white"
              autoFocus
              selectionColor="#3B82F6"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            <View className="mt-8 flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSaving}
                className="items-center justify-center rounded-lg px-4 py-2.5"
                activeOpacity={0.7}
              >
                <Text className="font-semibold text-neutral-500 dark:text-neutral-400">
                  {(translate('base.cancel' as TxKeyPath) || 'Huỷ') as string}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="min-w-[80px] flex-row items-center justify-center rounded-xl bg-blue-500 px-4 py-2.5"
                activeOpacity={0.7}
              >
                {isSaving
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : (
                      <Text className="font-bold text-white">
                        {(translate('base.saveButton' as TxKeyPath) || 'Lưu') as string}
                      </Text>
                    )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
