import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUniwind } from 'uniwind';
import { Text, TouchableOpacity, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { AP_SSID_PREFIX, PRIMARY_GREEN_HEX } from '../constants';

export function ApConnectGuide({
  isConnecting,
  onConnect,
}: {
  isConnecting: boolean;
  onConnect: () => void;
}) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const steps = [
    {
      icon: 'wifi-cog' as const,
      title: translate('base.apStep1Title'),
      desc: translate('base.apStep1Desc'),
    },
    {
      icon: 'wifi' as const,
      title: translate('base.apStep2Title'),
      desc: `${translate('base.apStep2Desc')} "${AP_SSID_PREFIX}XXXX"`,
    },
    {
      icon: 'check-circle-outline' as const,
      title: translate('base.apStep3Title'),
      desc: translate('base.apStep3Desc'),
    },
  ];

  return (
    <View className="flex-1 px-5 pt-8">
      <Text className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
        {translate('base.apConnectTitle')}
      </Text>
      <Text className="mt-2 text-[15px] text-[#666666] dark:text-neutral-400">
        {translate('base.apConnectDesc')}
      </Text>

      <View className="mt-8 gap-y-5">
        {steps.map((step, index) => (
          <View key={step.icon} className="flex-row items-start">
            <View className="size-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
              <MaterialCommunityIcons
                name={step.icon}
                size={20}
                color={isDark ? PRIMARY_GREEN_HEX : '#059669'}
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[15px] font-bold text-[#1A1A1A] dark:text-white">
                {`${index + 1}. ${step.title}`}
              </Text>
              <Text className="mt-1 text-[13px] text-[#666666] dark:text-neutral-400">
                {step.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-auto pb-10">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onConnect}
          disabled={isConnecting}
          className="h-14 w-full items-center justify-center rounded-2xl"
          style={{
            backgroundColor: PRIMARY_GREEN_HEX,
            opacity: isConnecting ? 0.5 : 1,
          }}
        >
          <Text className="text-[16px] font-bold text-[#1B1B1B]">
            {isConnecting ? translate('base.connecting') : translate('base.apConfirmConnected')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
