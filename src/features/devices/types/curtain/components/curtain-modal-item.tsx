import type { TDevice, TDeviceEntity } from '@/types/device';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import Animated, { useAnimatedProps, useDerivedValue } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { Text, View } from '@/components/ui';
import { useShutterControl } from '@/features/devices/types/curtain/hooks/use-shutter-control';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ETheme } from '@/types/base';
import { CurtainSlider } from './curtain-slider';

// ── Control Button (same pattern as curtain-detail-screen) ─────────────────
function CtrlButton({
  icon,
  label,
  onPress,
  disabled,
  primary = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      className="items-center gap-2"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        className={`items-center justify-center rounded-full shadow-md ${
          primary ? 'size-[72px] bg-[#1B1B1B] dark:bg-white' : 'size-[56px] bg-white dark:border dark:border-[#292929] dark:bg-[#FFFFFF0D]'
        }`}
      >
        {icon}
      </View>
      <Text className={`text-xs font-medium ${primary ? 'text-[#1B1B1B] dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function CurtainModalItem({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  const {
    position,
    isControlling,
    isOnline,
    childLock,
    handleOpen,
    handleClose,
    handleStop,
    handleChildLock,
    handlePosition,
  } = useShutterControl(device, entity);
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const positionText = useDerivedValue(() => `${Math.round(position.value)}%`);
  const animatedProps = useAnimatedProps(() => ({ text: positionText.value } as any));

  return (
    <View className="w-full rounded-2xl p-4">
      {/* Position display + slider */}
      <View className="mb-2 items-center justify-center">
        <Animated.Text
          animatedProps={animatedProps}
          className="mb-2 text-xl font-bold text-[#A3E635]"
        />
        <CurtainSlider
          position={position}
          onSlidingComplete={handlePosition}
          disabled={true}
        />
      </View>

      {/* ── Child Lock Toggle (same as curtain detail) ──────────── */}
      <View className="my-1 mt-2 flex-row items-center justify-center">
        <TouchableOpacity
          className={cn(
            'w-1/3 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 shadow-sm',
            childLock ? 'bg-red-500 dark:bg-red-500/80' : 'bg-white dark:border dark:border-[#292929] dark:bg-[#FFFFFF0D]',
          )}
          onPress={() => handleChildLock(!childLock)}
          disabled={isControlling || !isOnline}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name={childLock ? 'lock' : 'lock-open'}
            size={15}
            color={childLock ? '#fff' : (isDark ? '#FFF' : '#1B1B1B')}
          />
          <Text className={`text-sm font-semibold ${childLock ? 'text-white' : 'text-[#1B1B1B] dark:text-white'}`}>
            {childLock
              ? translate('deviceDetail.shutter.childLockOn')
              : translate('deviceDetail.shutter.childLockOff')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Control buttons: Open → Stop → Close (same as detail) ── */}
      <View className="mt-4 flex-row items-end justify-between px-2">
        <CtrlButton
          icon={<FontAwesome6 name="chevron-up" size={18} color={isDark ? '#fff' : '#1B1B1B'} />}
          label={translate('deviceDetail.shutter.open')}
          onPress={handleOpen}
          disabled={isControlling || !isOnline}
        />
        <CtrlButton
          icon={<FontAwesome6 name="pause" size={18} color={isDark ? '#1B1B1B' : '#fff'} />}
          label={translate('deviceDetail.shutter.stop')}
          onPress={handleStop}
          disabled={isControlling || !isOnline}
          primary
        />
        <CtrlButton
          icon={<FontAwesome6 name="chevron-down" size={18} color={isDark ? '#fff' : '#1B1B1B'} />}
          label={translate('deviceDetail.shutter.close')}
          onPress={handleClose}
          disabled={isControlling || !isOnline}
        />
      </View>
    </View>
  );
}
