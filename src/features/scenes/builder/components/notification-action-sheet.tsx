import React, { forwardRef, useCallback, useState } from 'react';
import { TextInput } from 'react-native';
import { useUniwind } from 'uniwind';

import { Button, Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { useSceneBuilderStore } from '@/features/scenes/builder/stores/scene-builder-store';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { ESceneActionType } from '@/types/scene';

type TProps = {
    onSuccess?: () => void;
};

export const NotificationActionSheet = forwardRef<any, TProps>(({ onSuccess }, ref) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const addAction = useSceneBuilderStore((s) => s.addAction);

    const { theme } = useUniwind();
    const isDark = theme === ETheme.Dark;

    const handleSave = useCallback(() => {
        if (!title.trim() || !body.trim()) return;

        addAction({
            type: ESceneActionType.Notification,
            notificationTitle: title.trim(),
            notificationBody: body.trim(),
        });

        setTitle('');
        setBody('');

        (ref as React.RefObject<any>)?.current?.dismiss();
        onSuccess?.();
    }, [addAction, title, body, ref, onSuccess]);

    const canSave = title.trim().length > 0 && body.trim().length > 0;

    return (
        <Modal ref={ref} snapPoints={['60%']} title={translate('scenes.builder.actionTypeNotification')}>
            <View className="flex-1 px-4 pt-4">

                <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tiêu đề
                </Text>
                <View className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-white/10 dark:bg-charcoal-900">
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="VD: Cảnh báo hệ thống"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        className="text-[15px] font-medium text-gray-900 dark:text-white"
                    />
                </View>

                <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nội dung thông báo
                </Text>
                <View className="mb-8 min-h-[120px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-white/10 dark:bg-charcoal-900">
                    <TextInput
                        value={body}
                        onChangeText={setBody}
                        placeholder="VD: Có người lạ xâm nhập!"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        multiline
                        style={{ minHeight: 90, textAlignVertical: 'top' }}
                        className="text-[15px] leading-6 text-gray-900 dark:text-white"
                    />
                </View>

                <Button
                    label={translate('base.save')}
                    className={`h-[52px] rounded-full ${!canSave ? 'bg-emerald-500/50' : 'bg-emerald-500'}`}
                    textClassName="text-lg font-semibold text-white"
                    disabled={!canSave}
                    onPress={handleSave}
                />
            </View>
        </Modal>
    );
});
