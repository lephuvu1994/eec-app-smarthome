import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { PRIMARY_GREEN_HEX } from '../constants';

export function ConfiguringView({
  statusText,
}: {
  statusText?: string;
}) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Animated.View
        className="size-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30"
        style={{
          transform: [{ rotate: `${rotation.value}deg` }],
        }}
      >
        <MaterialCommunityIcons name="cog" size={40} color={PRIMARY_GREEN_HEX} />
      </Animated.View>

      <Text className="mt-8 text-center text-xl font-bold text-[#1A1A1A] dark:text-white">
        {translate('base.configuringDevice')}
      </Text>

      <Text className="mt-3 text-center text-[15px] text-[#666666] dark:text-neutral-400">
        {statusText || translate('base.configuringDeviceDesc')}
      </Text>
    </View>
  );
}
