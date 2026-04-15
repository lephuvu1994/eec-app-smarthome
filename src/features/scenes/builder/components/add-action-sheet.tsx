import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { ESceneActionType } from '@/types/scene';

// ─── Action options definition ─────────────────────────────────────────────────

type TActionOption = {
  type: ESceneActionType;
  icon: string;
  iconColor: string;
  iconBg: string;
  titleKey: string;
  descKey: string;
};

const ACTION_OPTIONS: TActionOption[] = [
  {
    type: ESceneActionType.DeviceControl,
    icon: 'lightning-bolt',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    titleKey: 'scenes.builder.actionTypeDevice',
    descKey: 'scenes.builder.actionTypeDeviceDesc',
  },
  {
    type: ESceneActionType.RunScene,
    icon: 'check-circle-outline',
    iconColor: '#6366F1',
    iconBg: '#EDE9FE',
    titleKey: 'scenes.builder.actionTypeScene',
    descKey: 'scenes.builder.actionTypeSceneDesc',
  },
  {
    type: ESceneActionType.Delay,
    icon: 'timer-outline',
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    titleKey: 'scenes.builder.actionTypeDelay',
    descKey: 'scenes.builder.actionTypeDelayDesc',
  },
  {
    type: ESceneActionType.Notification,
    icon: 'bell-outline',
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
    titleKey: 'scenes.builder.actionTypeNotification',
    descKey: 'scenes.builder.actionTypeNotificationDesc',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

type TProps = {
  ref?: React.RefObject<any>;
  onSelectType: (type: ESceneActionType) => void;
  /** Action types that should appear dimmed and non-tappable */
  disabledTypes?: ESceneActionType[];
  /** Badge text shown on disabled items */
  disabledLabel?: string;
};

export function AddActionSheet({ ref, onSelectType, disabledTypes = [], disabledLabel }: TProps) {
  const handleSelect = (type: ESceneActionType) => {
    ref?.current?.dismiss();
    onSelectType(type);
  };

  return (
    <Modal
      ref={ref}
      snapPoints={['52%']}
      title={translate('scenes.builder.addAction')}
    >
      <View className="px-4 pt-2 pb-8">
        {ACTION_OPTIONS.map((opt) => {
          const isDisabled = disabledTypes.includes(opt.type);
          return (
            <Pressable
              key={opt.type}
              onPress={isDisabled ? undefined : () => handleSelect(opt.type)}
              style={{ opacity: isDisabled ? 0.45 : 1 }}
              className="mb-2 flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm active:opacity-70 dark:bg-white/10"
            >
              {/* Icon */}
              <View
                className="size-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: opt.iconBg }}
              >
                <MaterialCommunityIcons name={opt.icon as any} size={22} color={opt.iconColor} />
              </View>

              {/* Texts */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
                    {translate(opt.titleKey as any)}
                  </Text>
                  {isDisabled && disabledLabel && (
                    <View className="rounded-full bg-neutral-200 px-2 py-0.5 dark:bg-white/10">
                      <Text className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        {disabledLabel}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="mt-0.5 text-xs text-[#6B7280] dark:text-white/50">
                  {translate(opt.descKey as any)}
                </Text>
              </View>

              {/* Arrow — hide when disabled */}
              {!isDisabled && (
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
              )}
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}
