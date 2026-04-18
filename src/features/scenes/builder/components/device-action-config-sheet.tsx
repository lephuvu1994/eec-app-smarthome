import type { TDeviceEntity } from '@/types/device';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator, Button, Text, TouchableOpacity, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { useDeviceDetail } from '@/hooks/use-devices';
import { translate } from '@/lib/i18n';
import { useSceneBuilderStore } from '@/features/scenes/builder/stores/scene-builder-store';
import { ESceneActionType } from '@/types/scene';

type TProps = {
    deviceId: string | null;
    deviceToken: string | null;
    deviceName: string | null;
    onSuccess?: () => void;
};

// Kiểu state để lưu giá trị được chọn tạm thời cho từng entity
type TEntityState = Record<string, boolean>;

export const DeviceActionConfigSheet = forwardRef<any, TProps>(
    ({ deviceId, deviceToken, deviceName, onSuccess }, ref) => {
        const insets = useSafeAreaInsets();
        const { data: device, isLoading } = useDeviceDetail(deviceId || '');
        const addAction = useSceneBuilderStore((s) => s.addAction);

        // Lưu tạm trạng thái được cấu hình (ví dụ: đang muốn thiết lập bật hay tắt)
        const [selectedEntities, setSelectedEntities] = useState<TEntityState>({});

        useEffect(() => {
            if (deviceId) {
                setSelectedEntities({}); // Reset form khi mở device mới
            }
        }, [deviceId]);

        const handleToggleEntity = (entityCode: string, value: boolean) => {
            setSelectedEntities((prev) => ({ ...prev, [entityCode]: value }));
        };

        const handleSave = useCallback(() => {
            if (!deviceToken || !deviceName || Object.keys(selectedEntities).length === 0) {
                return;
            }

            // Vòng lặp từng entity đã được cấu hình tĩnh và thêm thành những action rời rạc hoặc gộp lại
            // Theo mô hình TSceneAction, lưu từng action
            Object.entries(selectedEntities).forEach(([entityCode, value]) => {
                addAction({
                    type: ESceneActionType.DeviceControl,
                    deviceToken,
                    deviceName,
                    entityCode,
                    value,
                });
            });

            // Tắt modal & quay lại màn builder
            (ref as React.RefObject<any>)?.current?.dismiss();
            onSuccess?.();
        }, [addAction, deviceToken, deviceName, selectedEntities, ref, onSuccess]);

        const canSave = Object.keys(selectedEntities).length > 0;
        const snapPoints = React.useMemo(() => [insets.bottom + 420], [insets.bottom]);

        return (
            <Modal ref={ref} snapPoints={snapPoints} title={deviceName || translate('scenes.builder.selectDevice')}>
                <View className="flex-1 px-4 pt-2">
                    {isLoading ? (
                        <View className="mt-10 items-center justify-center">
                            <ActivityIndicator size="large" color="#10B981" />
                            <Text className="mt-4 text-sm text-gray-500">{translate('base.loading')}</Text>
                        </View>
                    ) : !device || !device.entities || device.entities.length === 0 ? (
                        <View className="mt-10 items-center justify-center">
                            <Text className="text-gray-500 text-center">{translate('scenes.builder.noEntitiesFound')}</Text>
                        </View>
                    ) : (
                        <View className="flex-1">
                            <Text className="mb-4 text-sm text-gray-500 font-medium pb-2">
                                {translate('scenes.builder.configureDeviceStateText')}
                            </Text>

                            {device.entities.map((entity: TDeviceEntity) => {
                                // Chỉ hỗ trợ các entity có thể set on/off (boolean) cho bản MVP này theo Tuya chuẩn.
                                if (entity.readOnly) return null;

                                const isSelected = selectedEntities[entity.code] !== undefined;
                                const value = isSelected ? selectedEntities[entity.code] : true;

                                return (
                                    <View key={entity.code} className="mb-3 rounded-2xl bg-gray-50 p-4 dark:bg-charcoal-900 border border-gray-100 dark:border-white/5 shadow-sm">
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View className="flex-row items-center gap-3">
                                                <View className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center">
                                                    <MaterialCommunityIcons name="power-standby" size={20} color="#10B981" />
                                                </View>
                                                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                    {entity.name}
                                                </Text>
                                            </View>

                                            {/* Checkbox ẩn/hiện cấu hình */}
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (isSelected) {
                                                        const newStates = { ...selectedEntities };
                                                        delete newStates[entity.code];
                                                        setSelectedEntities(newStates);
                                                    } else {
                                                        handleToggleEntity(entity.code, true);
                                                    }
                                                }}
                                                className="size-6 rounded border border-gray-300 dark:border-gray-600 items-center justify-center"
                                                style={{ backgroundColor: isSelected ? '#10B981' : 'transparent', borderColor: isSelected ? '#10B981' : '#D1D5DB' }}
                                            >
                                                {isSelected && <MaterialCommunityIcons name="check" size={16} color="white" />}
                                            </TouchableOpacity>
                                        </View>

                                        {isSelected && (
                                            <View className="flex-row items-center justify-between border-t border-gray-200 dark:border-white/10 pt-4 mt-2">
                                                <Text className="text-[15px] text-gray-700 dark:text-gray-300">
                                                    {translate('scenes.builder.deviceState')}
                                                </Text>
                                                <View className="flex-row items-center gap-3 bg-white dark:bg-black rounded-lg px-2 py-1 shadow-sm">
                                                    <Text className={`text-sm font-semibold ${!value ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                                        {translate('base.off')}
                                                    </Text>
                                                    <Switch
                                                        value={value}
                                                        onValueChange={(val) => handleToggleEntity(entity.code, val)}
                                                        trackColor={{ true: '#10B981', false: '#D1D5DB' }}
                                                    />
                                                    <Text className={`text-sm font-semibold ${value ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                        {translate('base.on')}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Nút lưu */}
                    <Button
                        label={translate('base.save')}
                        className={`mt-4 h-[52px] rounded-full ${!canSave ? 'bg-emerald-500/50' : 'bg-emerald-500'}`}
                        textClassName="font-semibold text-lg text-white"
                        disabled={!canSave}
                        onPress={handleSave}
                    />
                </View>
            </Modal>
        );
    }
);
