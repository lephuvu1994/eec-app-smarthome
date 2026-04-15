import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { useCallback, useImperativeHandle, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal as RNModal, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

import { Button, Input, IS_IOS, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

type SaveSceneSheetProps = {
  onSave: (name: string, icon: string) => void;
  isCreating: boolean;
  initialName?: string;
  initialIcon?: string;
};

const SCENE_ICONS = [
  'lightning-bolt',
  'weather-sunny',
  'weather-night',
  'home',
  'home-export-outline',
  'bed-empty',
  'silverware-fork-knife',
  'movie-open',
  'party-popper',
  'sofa',
  'book-open-page-variant',
  'music',
  'gamepad-variant',
  'run',
  'bell',
];

export function SaveSceneSheet({ ref, onSave, isCreating, initialName, initialIcon }: SaveSceneSheetProps & { ref?: React.RefObject<any | null> }) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(initialName || '');
  const [icon, setIcon] = useState(initialIcon || 'lightning-bolt');

  React.useEffect(() => {
    if (initialName)
      setName(initialName);
    if (initialIcon)
      setIcon(initialIcon);
  }, [initialName, initialIcon]);

  useImperativeHandle(ref, () => ({
    present: () => setVisible(true),
    dismiss: () => setVisible(false),
  }));

  const handleSave = useCallback(() => {
    if (!name.trim())
      return;
    onSave(name.trim(), icon);
  }, [name, icon, onSave]);

  return (
    <RNModal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={IS_IOS ? 'padding' : 'height'}
          className="flex-1 items-center justify-center bg-black/40 p-4"
        >
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-xl dark:bg-neutral-800">
              <Text className="mb-6 text-center text-xl font-bold text-[#1B1B1B] dark:text-white">
                {translate('scenes.builder.nameLabel') || 'Lưu kịch bản'}
              </Text>

              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Tên kịch bản
                </Text>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder={translate('scenes.builder.namePlaceholder')}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                  editable={!isCreating}
                />
              </View>

              {/* Icon Grid */}
              <Text className="mt-2 mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                Chọn biểu tượng
              </Text>
              <View className="h-[180px] w-full rounded-2xl bg-gray-50 p-2 dark:bg-neutral-900/50">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 4 }}>
                  <View className="flex-row flex-wrap justify-center gap-3">
                    {SCENE_ICONS.map((ic) => {
                      const isSelected = icon === ic;
                      return (
                        <TouchableOpacity
                          key={ic}
                          onPress={() => setIcon(ic)}
                          className={`size-[48px] items-center justify-center rounded-2xl border ${
                            isSelected
                              ? 'border-[#A3E635] bg-[#A3E635]/20 dark:bg-[#A3E635]/10'
                              : 'border-transparent bg-white dark:bg-neutral-800'
                          } shadow-sm`}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons
                            name={ic as any}
                            size={24}
                            color={isSelected ? '#65A30D' : '#6B7280'}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>

              <View className="mt-6 flex-row gap-3">
                <Button
                  label={translate('base.cancel')}
                  variant="outline"
                  onPress={() => setVisible(false)}
                  className="h-12 flex-1 rounded-2xl border-gray-200"
                  textClassName="text-gray-600 dark:text-gray-300 font-semibold"
                />
                <Button
                  label={translate('scenes.builder.save')}
                  onPress={handleSave}
                  disabled={!name.trim() || isCreating}
                  loading={isCreating}
                  className="h-12 flex-1 rounded-2xl bg-[#A3E635]"
                  textClassName="text-[#1B1B1B] font-bold"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

SaveSceneSheet.displayName = 'SaveSceneSheet';
