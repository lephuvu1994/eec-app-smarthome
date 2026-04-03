import type { TxKeyPath } from '@/lib/i18n';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Modal as RNModal, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Input, IS_IOS, Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

type EditProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  initialFirstName?: string;
  initialLastName?: string;
  isSaving?: boolean;
  onSave: (firstName: string, lastName: string) => void;
};

export function EditProfileModal({
  visible,
  onClose,
  initialFirstName = '',
  initialLastName = '',
  isSaving = false,
  onSave,
}: EditProfileModalProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => {
        setFirstName(initialFirstName);
        setLastName(initialLastName);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialFirstName, initialLastName, visible]);

  const handleSave = useCallback(() => {
    const fName = firstName.trim();
    const lName = lastName.trim();
    if (!fName && !lName) {
      return;
    }
    if (fName === initialFirstName && lName === initialLastName) {
      return;
    }
    onSave(fName, lName);
  }, [firstName, lastName, initialFirstName, initialLastName, onSave]);

  const isValid = (firstName.trim().length > 0 || lastName.trim().length > 0)
    && (firstName.trim() !== initialFirstName || lastName.trim() !== initialLastName);

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={IS_IOS ? 'padding' : 'height'}
          className="flex-1 items-center justify-center bg-black/40 px-4"
        >
          <View className="w-full rounded-2xl bg-white p-5 shadow-lg dark:bg-neutral-900" onStartShouldSetResponder={() => true}>
            <Text className="mb-4 text-center text-lg font-bold text-[#1B1B1B] dark:text-white">
              {translate('settings.editProfile' as TxKeyPath)}
            </Text>

            <Input
              label={translate('formAuth.firstName' as TxKeyPath)}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={translate('formAuth.firstName' as TxKeyPath)}
              editable={!isSaving}
            />

            <View className="mb-4">
              <Input
                label={translate('formAuth.lastName' as TxKeyPath)}
                value={lastName}
                onChangeText={setLastName}
                placeholder={translate('formAuth.lastName' as TxKeyPath)}
                editable={!isSaving}
              />
            </View>

            <View className="mt-2 flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                className="flex-1 items-center rounded-xl bg-neutral-100 py-3.5 dark:bg-neutral-800"
              >
                <Text className="text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
                  {translate('base.cancel' as TxKeyPath)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={!isValid || isSaving}
                activeOpacity={0.8}
                className="flex-1 items-center rounded-xl bg-emerald-500 py-3.5 disabled:opacity-50"
              >
                <Text className="text-[15px] font-semibold text-white">
                  {isSaving ? translate('base.loading' as TxKeyPath) : translate('base.save' as TxKeyPath)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
