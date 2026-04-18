import type { TSceneAction } from '../hooks/use-scene-builder';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from '@/components/ui';
import { WIDTH } from '@/components/ui/utils';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { translate } from '@/lib/i18n';
import { ESceneActionType } from '@/types/scene';

const ITEM_WIDTH = WIDTH - BASE_SPACE_HORIZONTAL * 2;

// ─── ICON MAP ──────────────────────────────────────────────────────────────────

const ACTION_ICON_MAP: Record<ESceneActionType, { name: string; color: string; bg: string }> = {
    [ESceneActionType.DeviceControl]: { name: 'lightning-bolt', color: '#10B981', bg: '#D1FAE5' },
    [ESceneActionType.RunScene]: { name: 'check-circle-outline', color: '#6366F1', bg: '#EDE9FE' },
    [ESceneActionType.Delay]: { name: 'timer-outline', color: '#F59E0B', bg: '#FEF3C7' },
    [ESceneActionType.Notification]: { name: 'bell-outline', color: '#3B82F6', bg: '#DBEAFE' },
};

// ─── Labels ────────────────────────────────────────────────────────────────────

function formatDelayMs(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [
        h > 0 ? `${h}h` : '',
        m > 0 ? `${m}m` : '',
        s > 0 ? `${s}s` : '',
    ].filter(Boolean).join(' ') || '0s';
}

function getActionLabel(action: TSceneAction): string {
    switch (action.type) {
        case ESceneActionType.DeviceControl:
            return action.deviceName || action.deviceToken || translate('scenes.builder.actionTypeDevice');
        case ESceneActionType.Delay:
            return action.delayMs
                ? `${translate('scenes.builder.actionTypeDelay')}: ${formatDelayMs(action.delayMs)}`
                : translate('scenes.builder.actionTypeDelay');
        case ESceneActionType.RunScene:
            return action.sceneName
                ? `${translate('scenes.builder.actionTypeScene')}: ${action.sceneName}`
                : translate('scenes.builder.actionTypeScene');
        case ESceneActionType.Notification:
            return action.notificationTitle
                ? `${translate('scenes.builder.actionTypeNotification')}: ${action.notificationTitle}`
                : translate('scenes.builder.actionTypeNotification');
    }
}

// ─── Component ─────────────────────────────────────────────────────────────────

type TProps = {
    action: TSceneAction;
    index: number;
    onRemove: (index: number) => void;
};

export function ActionItem({ action, index, onRemove }: TProps) {
    const meta = ACTION_ICON_MAP[action.type];

    return (
        <View
            className="min-h-[56px] flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-white/10"
            style={{ width: ITEM_WIDTH }}
        >
            {/* Icon */}
            <View
                className="size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: meta.bg }}
            >
                <MaterialCommunityIcons name={meta.name as any} size={20} color={meta.color} />
            </View>

            {/* Label */}
            <View className="flex-1">
                <Text
                    className="text-sm font-medium text-[#1B1B1B] dark:text-white"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {getActionLabel(action)}
                </Text>
            </View>

            {/* Remove button */}
            <Pressable
                onPress={() => onRemove(index)}
                className="size-8 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30"
                hitSlop={8}
            >
                <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
            </Pressable>
        </View>
    );
}
