import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import { FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';
import { SelectEntitySheet } from '../modals/select-entity-sheet';

// ─── Types ──────────────────────────────────────────────────────────────────
type Props = {
  device: TDevice;
  entities: TDeviceEntity[];
};

// ─── Action Button ───────────────────────────────────────────────────────────
type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'on' | 'off';
};

function ActionButton({ icon, label, onPress, variant = 'default' }: ActionButtonProps) {
  const bgClass
    = variant === 'on'
      ? 'bg-[#A3E635]'
      : variant === 'off'
        ? 'bg-[#1B1B1B] dark:bg-white'
        : 'bg-white dark:bg-[#FFFFFF12]';

  return (
    <TouchableOpacity
      className="flex-1 items-center gap-1.5"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`h-12 w-full items-center justify-center gap-2 rounded-2xl shadow-sm ${bgClass} dark:border dark:border-[#292929]`}>
        {icon}
        <Text className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Group All Toggle ────────────────────────────────────────────────────────
function useGroupToggle(device: TDevice, entities: TDeviceEntity[]) {
  const allowHaptics = useConfigManager(state => state.allowHaptics);
  const updateDeviceEntity = useDeviceStore(state => state.updateDeviceEntity);

  const setGroupState = React.useCallback(async (targetState: 0 | 1) => {
    if (allowHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Optimistic update
    entities.forEach((entity) => {
      updateDeviceEntity(device.id, entity.code, { state: targetState });
    });

    try {
      await Promise.all(entities.map(entity =>
        deviceService.setEntityValue(device.token, entity.code, targetState),
      ));
    }
    catch {
      if (allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [allowHaptics, entities, device, updateDeviceEntity]);

  const handleAllOn = React.useCallback(() => setGroupState(1), [setGroupState]);
  const handleAllOff = React.useCallback(() => setGroupState(0), [setGroupState]);

  return { handleAllOn, handleAllOff };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DeviceActionBar({ device, entities }: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const selectEntityModal = useModal();
  const [actionMode, setActionMode] = React.useState<'schedule' | 'timer'>('schedule');

  // isMultiGang determines if we show the "All On / All Off" master buttons
  // (e.g., a 3-gang switch has 3 primary entities).
  // A curtain with 1 main + 1 child_lock is NOT a multi-gang.
  const isMultiGang = React.useMemo(() => getPrimaryEntities(device).length > 1, [device]);

  // hasMultiTargets determines if we need to show the Select Entity Sheet for schedules/timers
  const hasMultiTargets = entities.length > 1;

  const { handleAllOn, handleAllOff } = useGroupToggle(device, entities);

  const handleEntitySelect = React.useCallback((entity: TDeviceEntity) => {
    selectEntityModal.dismiss();
    const route = actionMode === 'schedule' ? 'schedule' : 'timer';
    router.push({
      pathname: `/device/[id]/${route}`,
      params: { id: device.id, entityId: entity.id },
    });
  }, [device.id, router, actionMode, selectEntityModal]);

  const handleActionPress = React.useCallback((mode: 'schedule' | 'timer') => {
    setActionMode(mode);
    if (hasMultiTargets) {
      selectEntityModal.present();
    }
    else {
      // Small timeout to ensure state is set, though standard router push could just use the mode directly
      router.push({
        pathname: `/device/[id]/${mode}`,
        params: { id: device.id, entityId: entities[0].id },
      });
    }
  }, [hasMultiTargets, selectEntityModal, entities, device.id, router]);

  return (
    <>
      <Animated.View
        entering={FadeInUp.duration(300)}
        className="absolute inset-x-0 bottom-0 border-t border-neutral-200 bg-white px-4 shadow-lg dark:border-[#292929] dark:bg-[#1B1B1B]"
        style={{ paddingTop: 12, paddingBottom: insets.bottom }}
      >
        <View className="flex-row gap-3">
          {/* Bật tất / Tắt tất — chỉ hiện với thiết bị dạng Multi-Gang (nhiều nút chính) */}
          {isMultiGang && (
            <>
              <ActionButton
                icon={<FontAwesome5 name="power-off" size={16} color="#1B1B1B" />}
                label={translate('automation.bar.allOn')}
                onPress={handleAllOn}
                variant="on"
              />
              <ActionButton
                icon={<FontAwesome5 name="power-off" size={16} color={isDark ? '#1B1B1B' : '#fff'} />}
                label={translate('automation.bar.allOff')}
                onPress={handleAllOff}
                variant="off"
              />
            </>
          )}

          {/* Đếm ngược */}
          <ActionButton
            icon={<MaterialCommunityIcons name="timer-outline" size={20} color={isDark ? '#fff' : '#1B1B1B'} />}
            label={translate('automation.bar.countdown')}
            onPress={() => handleActionPress('timer')}
          />

          {/* Hẹn giờ */}
          <ActionButton
            icon={<FontAwesome6 name="clock" size={18} color={isDark ? '#fff' : '#1B1B1B'} />}
            label={translate('automation.bar.schedule')}
            onPress={() => handleActionPress('schedule')}
          />
        </View>
      </Animated.View>

      {/* Select entity sheet — group only */}
      {hasMultiTargets && (
        <SelectEntitySheet
          modalRef={selectEntityModal.ref}
          device={device}
          entities={entities}
          onSelect={handleEntitySelect}
          title={actionMode === 'schedule' ? translate('automation.selectEntity.forSchedule') : translate('automation.countdown.title')}
        />
      )}
    </>
  );
}
