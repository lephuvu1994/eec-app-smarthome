import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';

// ─── Selection modes ────────────────────────────────────────────────────────────

export type TDeviceSelectionMode = 'single' | 'multi';

// ─── Component ─────────────────────────────────────────────────────────────────

type TProps = {
  ref?: React.RefObject<any>;
  onSelectMode: (mode: TDeviceSelectionMode) => void;
};

export function DeviceSelectionSheet({ ref, onSelectMode }: TProps) {
  const handleSelect = (mode: TDeviceSelectionMode) => {
    ref?.current?.dismiss();
    onSelectMode(mode);
  };

  return (
    <Modal
      ref={ref}
      snapPoints={['32%']}
      title={translate('scenes.builder.actionTypeDevice')}
    >
      <View className="px-4 pt-2 pb-8">
        {/* Chọn một thiết bị */}
        <Pressable
          onPress={() => handleSelect('single')}
          className="mb-2 flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm active:opacity-70 dark:bg-white/10"
        >
          <View className="size-11 items-center justify-center rounded-xl bg-[#D1FAE5]">
            <MaterialCommunityIcons name="toggle-switch-outline" size={22} color="#10B981" />
          </View>
          <Text className="flex-1 text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
            {translate('scenes.builder.deviceSelectOne')}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </Pressable>

        {/* Chọn nhiều thiết bị */}
        <Pressable
          onPress={() => handleSelect('multi')}
          className="mb-2 flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-4 shadow-sm active:opacity-70 dark:bg-white/10"
        >
          <View className="size-11 items-center justify-center rounded-xl bg-[#DBEAFE]">
            <MaterialCommunityIcons name="format-list-checks" size={22} color="#3B82F6" />
          </View>
          <Text className="flex-1 text-[15px] font-semibold text-[#1B1B1B] dark:text-white">
            {translate('scenes.builder.deviceSelectMany')}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
        </Pressable>
      </View>
    </Modal>
  );
}
