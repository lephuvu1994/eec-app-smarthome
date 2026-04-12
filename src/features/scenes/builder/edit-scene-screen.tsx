import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { CustomHeader, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Button, colors, showSuccessMessage, Text, TouchableOpacity, View } from '@/components/ui';
import { ActionList } from '@/features/scenes/builder/components/action-list';
import { AddActionSheet } from '@/features/scenes/builder/components/add-action-sheet';
import { SaveSceneSheet } from '@/features/scenes/builder/components/save-scene-sheet';
import { useSceneBuilderStore } from '@/features/scenes/builder/stores/scene-builder-store';
import { useDeleteScene, useSceneDetail, useUpdateScene } from '@/features/scenes/common/use-scenes';
import { ESceneActionType } from '@/types/scene';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useHomeStore } from '@/stores/home/home-store';
import { ETheme } from '@/types/base';

export function EditSceneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const homeId = useHomeStore.use.selectedHomeId();

  const { data: sceneDetail, isFetching } = useSceneDetail(id || '');
  const { mutate: updateScene, isPending: isUpdating } = useUpdateScene(id || '', homeId);
  const { mutate: deleteScene, isPending: isDeleting } = useDeleteScene(homeId);

  const {
    actions,
    clearStore,
    removeAction,
    reorderActions,
    roomId,
    setRoomId,
    showOnHome,
    setShowOnHome,
    icon,
    setIcon,
    setName,
  } = useSceneBuilderStore();

  const addActionSheetRef = useRef<BottomSheetModal>(null);
  const saveSheetRef = useRef<BottomSheetModal>(null);

  const hasInitedRef = useRef(false);

  // Khởi tạo store với dữ liệu scene cũ 1 lần duy nhất
  useEffect(() => {
    if (sceneDetail && !hasInitedRef.current) {
      setName(sceneDetail.name);
      setIcon(sceneDetail.icon || 'lightning-bolt');
      setRoomId(sceneDetail.roomId || '');
      // Map về định dạng store TSceneAction & { _id: string }
      useSceneBuilderStore.setState({
        actions: (sceneDetail.actions || []).map((action: any) => ({
          ...action,
          _id: Math.random().toString(36).substr(2, 9),
        })),
      });
      hasInitedRef.current = true;
    }
  }, [sceneDetail, setName, setIcon, setRoomId]);

  // Dọn dẹp store khi thoát màn Edit
  useEffect(() => {
    return () => clearStore();
  }, [clearStore]);

  const handleToggleRoom = useCallback((val: boolean) => {
    if (val)
      setRoomId('mock-room-id-1');
    else setRoomId('');
  }, [setRoomId]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectActionType = useCallback((type: ESceneActionType) => {
    addActionSheetRef.current?.dismiss();
    if (type === ESceneActionType.DeviceControl) {
      setTimeout(() => router.push('/(app)/(mobile)/(scene)/device-selector'), 100);
    }
    else {
      useSceneBuilderStore.getState().addAction({ type }); // mock action tạm
    }
  }, [router]);

  const handleSaveFlow = useCallback(() => {
    saveSheetRef.current?.present();
  }, []);

  const handleConfirmSave = useCallback(
    (name: string) => {
      saveSheetRef.current?.dismiss();

      updateScene(
        {
          name,
          icon,
          roomId: roomId || undefined,
          actions: actions.map(({ _id, ...rest }) => rest) as any,
        },
        {
          onSuccess: () => {
            showSuccessMessage(translate('scenes.builder.updateSuccess') || 'Đã cập nhật kịch bản');
            router.back();
          },
        },
      );
    },
    [actions, updateScene, icon, roomId, router],
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      translate('base.delete' as any) || 'Xóa kịch bản',
      translate('base.deleteConfirm' as any) || 'Bạn có chắc chắn muốn xóa?',
      [
        { text: translate('base.cancel'), style: 'cancel' },
        {
          text: translate('base.delete' as any) || 'Xóa',
          style: 'destructive',
          onPress: () => {
            deleteScene(id || '', {
              onSuccess: () => {
                showSuccessMessage(translate('base.deleteSuccess' as any) || 'Đã xóa!');
                router.back();
              },
            });
          },
        },
      ],
    );
  }, [deleteScene, id, router]);

  if (!hasInitedRef.current && isFetching) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primaryActive} />
      </View>
    );
  }

  const isAutomation = !!(sceneDetail?.triggers && sceneDetail.triggers.length > 0);
  const title = isAutomation
    ? (translate('scenes.builder.automationEditTitle' as any) || 'Sửa Kịch Bản Tự Động')
    : (translate('scenes.builder.editTapToRunTitle' as any) || 'Sửa Kịch Bản Tạo Tay');
  const topIconName = isAutomation ? 'robot-outline' : 'gesture-tap';

  return (
    <BaseLayout>
      <CustomHeader
        leftContent={(
          <Button
            variant="ghost"
            label={translate('scenes.builder.cancel')}
            onPress={handleCancel}
            textClassName="font-medium text-md no-underline text-[#059669]"
          />
        )}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: headerOffset,
          paddingBottom: insets.bottom + 120, // để dư chỗ cho nút Lưu và Xóa
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Banner */}
        <View className="items-center justify-center py-2">
          <View className={`mb-4 size-20 items-center justify-center rounded-[24px] ${isAutomation ? 'bg-[#EFF6FF]' : 'bg-[#FDF2F8]'}`}>
            <MaterialCommunityIcons
              name={topIconName as any}
              size={42}
              color={isAutomation ? '#3B82F6' : colors.primaryActive}
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
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
                    <MaterialCommunityIcons name="format-list-bulleted" size={32} color={isDark ? '#525252' : '#D4D4D4'} />
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

        {/* Section 3: Display Settings */}
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

      {/* ── Fixed Bottom Actions ── */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        className="absolute inset-x-0 bottom-0 flex-row items-center gap-3 bg-white/90 px-4 pt-4 pb-6 backdrop-blur-md dark:bg-charcoal-950/90"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity
          className={cn(
            'h-[54px] flex-row items-center justify-center gap-2 rounded-2xl border border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-[#EF44441A]',
            actions.length > 0 ? 'px-6' : 'w-full flex-1',
          )}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.7}
        >
          {isDeleting
            ? (
                <ActivityIndicator size="small" color="#EF4444" />
              )
            : (
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
              )}
          {actions.length === 0 && !isDeleting && (
            <Text className="text-base font-semibold text-danger-500">
              {translate('base.delete')}
            </Text>
          )}
        </TouchableOpacity>

        {actions.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(300).springify()}
            className="flex-1"
          >
            <Button
              label={translate('base.save')}
              onPress={handleSaveFlow}
              loading={isUpdating}
              className="h-[54px] w-full rounded-2xl border-0 bg-[#A3EC3E]"
              textClassName="font-semibold text-[17px] text-[#1B1B1B]"
            />
          </Animated.View>
        )}
      </Animated.View>

      {/* Overlays */}
      <AddActionSheet ref={addActionSheetRef} onSelectType={handleSelectActionType} />
      <SaveSceneSheet
        ref={saveSheetRef}
        onSave={handleConfirmSave}
        isCreating={false}
        initialName={sceneDetail?.name}
      />
    </BaseLayout>
  );
}
