import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ScrollView, Switch } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';

import {
  Button,
  colors,
  IS_IOS,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { ActionList } from '@/features/scenes/builder/components/action-list';
import { AddActionSheet } from '@/features/scenes/builder/components/add-action-sheet';
import { SaveSceneSheet } from '@/features/scenes/builder/components/save-scene-sheet';
import { useSceneBuilder } from '@/features/scenes/builder/hooks/use-scene-builder';

import { useSceneBuilderStore } from '@/features/scenes/builder/stores/scene-builder-store';
import { ESceneActionType } from '@/types/scene';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export function TapToRunBuilderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const { createScene, isCreating, homeId } = useSceneBuilder();
  const { actions, clearStore, removeAction, reorderActions, roomId, setRoomId, showOnHome, setShowOnHome, icon } = useSceneBuilderStore();

  const addActionSheetRef = useRef<BottomSheetModal>(null);
  const saveSheetRef = useRef<BottomSheetModal>(null);

  // Thêm mock logic chọn phòng
  const handleToggleRoom = useCallback((val: boolean) => {
    if (val) {
      setRoomId('mock-room-id-1'); // Giả sử chọn luôn phòng khách
    }
    else {
      setRoomId('');
    }
  }, [setRoomId]);

  const handleCancel = useCallback(() => {
    clearStore();
    router.back();
  }, [clearStore, router]);

  const handleSelectActionType = useCallback((type: ESceneActionType) => {
    addActionSheetRef.current?.dismiss();
    if (type === ESceneActionType.DeviceControl) {
      setTimeout(() => router.push('/(app)/(mobile)/(scene)/device-selector'), 100);
    }
    else {
      useSceneBuilderStore.getState().addAction({ type }); // mock
    }
  }, [router]);

  const handleSaveFlow = useCallback(() => {
    saveSheetRef.current?.present();
  }, []);

  const handleConfirmSave = useCallback(
    async (name: string) => {
      if (!homeId)
        return;

      await createScene({
        name,
        icon,
        homeId,
        actions: actions.map(({ _id, ...rest }) => rest),
        triggers: [], // Tap-to-run -> rỗng
      });

      saveSheetRef.current?.dismiss();
      clearStore();
      router.back();
    },
    [actions, createScene, homeId, icon, clearStore, router],
  );

  return (
    <BaseLayout>
      <CustomHeader
        leftContent={(
          <Button
            variant="ghost"
            label={translate('scenes.builder.cancel')}
            onPress={handleCancel}
            textClassName="font-medium text-lg text-primary"
          />
        )}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: headerOffset,
          paddingBottom: insets.bottom + 100, // Đề phòng nút lưu
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Banner */}
        <View className="items-center justify-center py-2">
          <View className="mb-4 size-20 items-center justify-center rounded-[24px] bg-[#FDF2F8]">
            <MaterialCommunityIcons
              name="gesture-tap"
              size={42}
              color={colors.primaryActive}
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {translate('scenes.builder.createTapToRunTitle')}
          </Text>
        </View>

        {/* Section 2: Actions */}
        <View className="mt-4 w-full px-4">
          <View className="mb-3 ml-1 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#1B1B1B] dark:text-white">
              {translate('scenes.builder.actionsLabel')}
            </Text>
            <TouchableOpacity
              className="size-8 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800"
              onPress={() => addActionSheetRef.current?.present()}
            >
              <AntDesign name="plus" size={16} color={colors.charcoal[900]} style={{ opacity: 0.8 }} />
            </TouchableOpacity>
          </View>

          <Animated.View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            {actions.length === 0
              ? (
                  <View className="items-center py-6">
                    <MaterialCommunityIcons name="gesture-tap" size={32} color={isDark ? '#525252' : '#D4D4D4'} />
                    <Text className="mt-2 text-sm text-neutral-400">
                      {translate('scenes.builder.emptyActionDesc')}
                    </Text>
                  </View>
                )
              : (
                  <ActionList
                    actions={actions}
                    onRemove={index => removeAction(actions[index]._id)}
                    onReorder={reorderActions as any}
                  />
                )}
          </Animated.View>
        </View>

        {/* Section 3: Display Settings Section */}
        <View className="mt-8 w-full px-4">
          <Text className="mb-3 ml-1 text-lg font-bold text-[#1B1B1B] dark:text-white">
            {translate('scenes.builder.displayOptions')}
          </Text>
          <View className="flex-col rounded-3xl bg-white px-5 py-2 shadow-sm dark:bg-charcoal-900">

            {/* Show on Home Page */}
            <View className="flex-row items-center justify-between border-b border-gray-100 py-3 dark:border-neutral-800">
              <Text className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
                {translate('scenes.builder.showOnHome')}
              </Text>
              <Switch
                value={showOnHome}
                onValueChange={setShowOnHome}
                trackColor={{ true: '#10B981', false: '#D1D5DB' }}
              />
            </View>

            {/* Room Picker condition */}
            <View className="flex-col py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
                  {translate('scenes.builder.addRoomCondition')}
                </Text>
                <Switch
                  value={!!roomId}
                  onValueChange={handleToggleRoom}
                  trackColor={{ true: '#10B981', false: '#D1D5DB' }}
                />
              </View>
              {!!roomId && (
                <TouchableOpacity className="mt-3 flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-neutral-800/50">
                  <View className="flex-row items-center gap-3">
                    <MaterialCommunityIcons name="home-variant-outline" size={20} color="#6B7280" />
                    <Text className="text-[15px] font-medium text-gray-700 dark:text-gray-300">
                      Phòng Khách
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>
      </ScrollView>

      {/* Section 4: Animated Footer Save Button */}
      {actions.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(300).springify()}
          exiting={FadeOutDown.duration(200)}
          className="absolute inset-x-0 bottom-0 bg-white/90 px-6 pt-4 pb-6 backdrop-blur-md dark:bg-charcoal-950/90"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <Button
            label={translate('scenes.builder.save')}
            onPress={handleSaveFlow}
            className="bg-primary w-full rounded-full"
            textClassName="font-semibold text-[17px] text-white"
          />
        </Animated.View>
      )}

      {/* Bottom Sheets overlays */}
      {IS_IOS
        ? (
            <BottomSheetModalProvider>
              <AddActionSheet ref={addActionSheetRef} onSelectType={handleSelectActionType} />
              <SaveSceneSheet ref={saveSheetRef} onSave={handleConfirmSave} isCreating={isCreating} />
            </BottomSheetModalProvider>
          )
        : (
            <>
              <AddActionSheet ref={addActionSheetRef} onSelectType={handleSelectActionType} />
              <SaveSceneSheet ref={saveSheetRef} onSave={handleConfirmSave} isCreating={isCreating} />
            </>
          )}
    </BaseLayout>
  );
}
