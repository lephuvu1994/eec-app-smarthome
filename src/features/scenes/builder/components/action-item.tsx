import type { TSceneAction } from '../hooks/use-scene-builder';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from '@/components/ui';
import { ESceneActionType } from '@/lib/api/scenes/scene.service';
import { translate } from '@/lib/i18n';

// ─── ICON MAP ──────────────────────────────────────────────────────────────────

const ACTION_ICON_MAP: Record<string, { name: string; color: string; bg: string }> = {
  DEVICE_CONTROL: { name: 'lightning-bolt', color: '#10B981', bg: '#D1FAE5' },
  RUN_SCENE: { name: 'check-circle-outline', color: '#6366F1', bg: '#EDE9FE' },
  DELAY: { name: 'timer-outline', color: '#F59E0B', bg: '#FEF3C7' },
  NOTIFICATION: { name: 'bell-outline', color: '#3B82F6', bg: '#DBEAFE' },
};

// ─── Labels ────────────────────────────────────────────────────────────────────

function getActionLabel(action: TSceneAction): string {
  switch (action.type) {
    case ESceneActionType.DeviceControl:
      return action.deviceToken ?? translate('scenes.builder.actionTypeDevice');
    case ESceneActionType.Delay:
      return action.delayMs
        ? `${translate('scenes.builder.actionTypeDelay')} ${action.delayMs / 1000}s`
        : translate('scenes.builder.actionTypeDelay');
    case ESceneActionType.RunScene:
      return translate('scenes.builder.actionTypeScene');
    case ESceneActionType.Notification:
      return translate('scenes.builder.actionTypeNotification');
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
    <View className="flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm dark:bg-white/10">
      {/* Icon */}
      <View
        className="size-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: meta.bg }}
      >
        <MaterialCommunityIcons name={meta.name as any} size={20} color={meta.color} />
      </View>

      {/* Label */}
      <Text className="flex-1 text-sm font-medium text-[#1B1B1B] dark:text-white">
        {getActionLabel(action)}
      </Text>

      {/* Remove button */}
      <Pressable
        onPress={() => onRemove(index)}
        className="size-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30"
        hitSlop={8}
      >
        <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
      </Pressable>
    </View>
  );
}
