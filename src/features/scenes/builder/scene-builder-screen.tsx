import type { TDeviceSelectionMode } from './components/device-selection-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, Switch } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { Button, IS_IOS, Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { ESceneActionType } from '@/types/scene';

import { ActionList } from './components/action-list';
import { AddActionSheet } from './components/add-action-sheet';
import { DeviceSelectionSheet } from './components/device-selection-sheet';
import { SaveSceneSheet } from './components/save-scene-sheet';
import { SceneIconPicker } from './components/scene-icon-picker';
import { SelectModeDeviceSheet } from './components/select-mode-device-sheet';
import { useSceneBuilder } from './hooks/use-scene-builder';
import { useSceneBuilderStore } from './stores/scene-builder-store';
import { ESceneTriggerHubType } from './types/scene-trigger-hub';

export function SceneBuilderScreen() {
  const router = useRouter();
  const { triggerType } = useLocalSearchParams<{ triggerType?: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const { createScene, isCreating, homeId } = useSceneBuilder();

  // Store
  const {
    actions,
    icon,
    showOnHome,
    setTriggerType,
    setIcon,
    setShowOnHome,
    addAction,
    reorderActions,
    removeAction,
    clearStore,
  } = useSceneBuilderStore();

  const isManual = !triggerType || triggerType === ESceneTriggerHubType.Manual;

  // Khởi tạo triggerType vào store khi mount
  useEffect(() => {
    if (triggerType) {
      setTriggerType(triggerType as ESceneTriggerHubType);
    }
  }, [triggerType, setTriggerType]);

  // Sheets
  const addActionSheet = useModal();
  const deviceSelectionModeSheet = useModal();
  const deviceSelectionSheet = useModal();
  const saveSceneSheet = useModal();

  // ─── Save Flow ───────────────────────────────────────────────────────────────

  const handlePressSave = useCallback(() => {
    saveSceneSheet.present();
  }, [saveSceneSheet]);

  const handleConfirmSave = useCallback(
    async (name: string, newIcon: string) => {
      if (!homeId)
        return;

      await createScene({
        name,
        icon: newIcon,
        homeId,
        actions: actions.map(({ _id, ...rest }) => rest),
        triggers: isManual ? [] : [{ type: triggerType as any }],
      });

      // Thành công
      saveSceneSheet.dismiss();
      clearStore();
      router.back();
    },
    [actions, createScene, homeId, icon, isManual, triggerType, saveSceneSheet, clearStore, router],
  );

  // ─── Actions Handlers ────────────────────────────────────────────────────────

  const handleOpenAddAction = useCallback(() => {
    addActionSheet.present();
  }, [addActionSheet]);

  const handleSelectActionType = useCallback((type: ESceneActionType) => {
    addActionSheet.dismiss();
    if (type === ESceneActionType.DeviceControl) {
      console.log('device control');
      setTimeout(() => deviceSelectionModeSheet.present(), 100);
    }
    else {
      console.log('other');
      addAction({ type }); // mock
    }
  }, [addAction, addActionSheet, deviceSelectionModeSheet]);

  const handleSelectDeviceMode = useCallback((mode: TDeviceSelectionMode) => {
    deviceSelectionModeSheet.dismiss();
    setTimeout(() => {
      if (mode === 'single') {
        router.push('/(app)/(mobile)/(scene)/device-selector');
      }
      else {
        router.push('/(app)/(mobile)/(scene)/device-selector?mode=multi');
      }
    }, 100);
  }, [deviceSelectionModeSheet, router]);

  const handleSelectDevice = useCallback((_: TDeviceSelectionMode) => {
    // TODO: Route qua màn device-selector
    addAction({ type: ESceneActionType.DeviceControl, deviceToken: `mock-dev-${Date.now()}` });
  }, [addAction]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const canSave = actions.length > 0;

  return (
    <BaseLayout>
      <KeyboardAvoidingView
        behavior={IS_IOS ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-4 pb-3 dark:border-neutral-800 dark:bg-charcoal-950"
          style={{ paddingTop: top + 12 }}
        >
          <Button
            label={translate('scenes.builder.cancel')}
            variant="ghost"
            textClassName="text-[#6B7280]"
            onPress={() => {
              clearStore();
              router.back();
            }}
            className="px-0"
          />
          <Text className="text-lg font-bold text-[#1B1B1B] dark:text-white">
            {translate('scenes.builder.title')}
          </Text>
          <Button
            label={translate('scenes.builder.save')}
            variant="ghost"
            disabled={!canSave}
            textClassName="font-bold text-[#10B981]"
            onPress={handlePressSave}
            className="px-0"
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon Picker */}
          <View className="mb-8 w-full items-center">
            <SceneIconPicker value={icon} onChange={setIcon} />
          </View>

          {/* Actions Section */}
          <View className="mb-8 w-full">
            <View className="mb-3 flex-row items-center justify-between px-1">
              <Text className="text-lg font-bold text-[#1B1B1B] dark:text-white">
                {translate('scenes.builder.actionsLabel')}
              </Text>
            </View>

            <ActionList
              actions={actions}
              onReorder={reorderActions as any}
              onRemove={index => removeAction(actions[index]._id)}
            />

            <Button
              label={translate('scenes.builder.addAction')}
              variant="outline"
              className="mt-4 h-12 w-full rounded-2xl border-dashed border-[#10B981]"
              textClassName="font-semibold text-[#10B981]"
              onPress={handleOpenAddAction}
            />
          </View>

          {/* Display Settings Section */}
          <View className="w-full">
            <Text className="mb-3 ml-1 text-lg font-bold text-[#1B1B1B] dark:text-white">
              {translate('scenes.builder.displayOptions')}
            </Text>
            <View className="flex-col rounded-2xl bg-white px-4 py-1 shadow-sm dark:bg-charcoal-900">

              {/* Show on Home Page */}
              {isManual && (
                <View className="flex-row items-center justify-between border-b border-gray-100 py-3 dark:border-neutral-800">
                  <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {translate('scenes.builder.showOnHome')}
                  </Text>
                  <Switch
                    value={showOnHome}
                    onValueChange={setShowOnHome}
                    trackColor={{ true: '#10B981', false: '#D1D5DB' }}
                  />
                </View>
              )}

              {/* Room Picker mock */}
              <View className="flex-row items-center justify-between py-4">
                <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {translate('scenes.builder.assignToRoom')}
                </Text>
                <Text className="text-base text-gray-400 dark:text-gray-500">
                  {translate('scenes.builder.allRooms')}
                  {' '}
                  {'>'}
                </Text>
              </View>

            </View>
          </View>
        </ScrollView>

        {/* Sheets */}
        {IS_IOS
          ? (
              <BottomSheetModalProvider>
                <AddActionSheet ref={addActionSheet.ref} onSelectType={handleSelectActionType} />
                <SelectModeDeviceSheet ref={deviceSelectionModeSheet.ref} onSelectMode={handleSelectDeviceMode} />
                <DeviceSelectionSheet ref={deviceSelectionSheet.ref} onSelectMode={handleSelectDevice} />
                <SaveSceneSheet ref={saveSceneSheet.ref} onSave={handleConfirmSave} isCreating={isCreating} />
              </BottomSheetModalProvider>
            )
          : (
              <>
                <AddActionSheet ref={addActionSheet.ref} onSelectType={handleSelectActionType} />
                <SelectModeDeviceSheet ref={deviceSelectionModeSheet.ref} onSelectMode={handleSelectDeviceMode} />
                <DeviceSelectionSheet ref={deviceSelectionSheet.ref} onSelectMode={handleSelectDevice} />
                <SaveSceneSheet ref={saveSceneSheet.ref} onSave={handleConfirmSave} isCreating={isCreating} />
              </>
            )}
      </KeyboardAvoidingView>
    </BaseLayout>
  );
}
