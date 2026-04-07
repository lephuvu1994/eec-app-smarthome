import type { TMenuElement } from '@/components/ui/zeego-native-menu';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderBackButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, Text } from '@/components/ui';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';

type Props = { deviceId: string };

export function LightSettingsScreen({ deviceId }: Props) {
  const router = useRouter();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;
  const updateDeviceEntity = useDeviceStore(s => s.updateDeviceEntity);
  const primaryEntity = device ? getPrimaryEntities(device)[0] : undefined;

  const powerOnOptions = [
    { label: translate('deviceDetail.settings.options.powerOff') as string, value: 'off' },
    { label: translate('deviceDetail.settings.options.powerOn') as string, value: 'on' },
    { label: translate('deviceDetail.settings.options.powerPrevious') as string, value: 'previous' },
  ];

  const handleUpdateAttribute = async (entityCode: string, attributeKey: string, value: any) => {
    if (!device)
      return;
    try {
      if (primaryEntity) {
        updateDeviceEntity(deviceId, entityCode, { attributes: [{ key: attributeKey, value }] });
      }

      const attrConfig = primaryEntity?.attributes?.find(attr => attr.key === attributeKey);
      if (attrConfig?.commandKey) {
        await deviceService.setMultipleEntityValues(device.token, entityCode, { [attrConfig.commandKey]: value });
      }
    }
    catch (e) {
      console.error(e);
    }
  };

  const renderDropdownRow = ({ label, icon, value, options, onSelect }: { label: string; icon: string; value: string; options: { label: string; value: string }[]; onSelect: (val: string) => void }) => {
    const activeOption = options.find(o => o.value === value) || options[0];

    const menuElements: TMenuElement[] = [
      {
        type: 'group',
        key: 'group_options',
        items: options.map(opt => ({
          type: 'checkbox' as const,
          key: opt.value,
          title: opt.label,
          value: opt.value === value,
          onValueChange: (checked) => {
            if (checked) {
              onSelect(opt.value);
            }
          },
        })),
      },
    ];

    return (
      <ZeegoNativeMenu
        elements={menuElements}
        triggerComponent={(
          <View pointerEvents="none" className="flex-row items-center justify-between border-b border-black/5 p-4 dark:border-white/5">
            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-black/5 p-2 dark:bg-white/10">
                <MaterialCommunityIcons name={icon as any} size={20} color={isDark ? '#FFF' : '#1B1B1B'} />
              </View>
              <Text className="text-base font-medium text-black dark:text-white">{label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{activeOption.label}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
            </View>
          </View>
        )}
      />
    );
  };

  const renderToggleRow = ({ label, icon, value, onToggle }: { label: string; icon: string; value: boolean; onToggle: (val: boolean) => void }) => {
    return (
      <View className="flex-row items-center justify-between border-b border-black/5 p-4 dark:border-white/5">
        <View className="flex-row items-center gap-3">
          <View className="rounded-lg bg-black/5 p-2 dark:bg-white/10">
            <MaterialCommunityIcons name={icon as any} size={20} color={isDark ? '#FFF' : '#1B1B1B'} />
          </View>
          <Text className="text-base font-medium text-black dark:text-white">{label}</Text>
        </View>
        <Switch value={value} onValueChange={onToggle} />
      </View>
    );
  };

  if (!primaryEntity)
    return null;

  const powerAttr = primaryEntity.attributes?.find(a => a.key === 'power_on_behavior');
  const dndAttr = primaryEntity.attributes?.find(a => a.key === 'do_not_disturb');

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('deviceDetail.settings.lightTitle') as string}
          tintColor={isDark ? '#FFFFFF' : '#1B1B1B'}
          leftContent={<HeaderBackButton onPress={() => router.back()} color={isDark ? '#FFFFFF' : '#1B1B1B'} />}
        />
        <Image
          source={
            theme === ETheme.Dark
              ? require('@@/assets/base/background-dark.webp')
              : require('@@/assets/base/background-light.webp')
          }
          style={[
            {
              width: '100%',
              height: '100%',
              position: 'absolute',
            },
            StyleSheet.absoluteFillObject,
          ]}
          contentFit="cover"
        />
        <ScrollView contentContainerStyle={{ paddingTop: headerOffset + 16, paddingHorizontal: 16 }}>
          <Animated.View entering={FadeInDown.duration(400)} className="mb-6">
            <Text className="mb-3 pl-2 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
              {translate('deviceDetail.settings.deviceConfig') as string}
            </Text>
            <View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1C1C1E]">
              {powerAttr && renderDropdownRow({
                label: translate('deviceDetail.settings.powerOnBehaviorLight') as string,
                icon: 'power-cycle',
                value: (powerAttr.currentValue as string) || 'off',
                options: powerOnOptions,
                onSelect: val => handleUpdateAttribute(primaryEntity.code, 'power_on_behavior', val),
              })}
              {dndAttr && renderToggleRow({
                label: translate('deviceDetail.settings.doNotDisturb') as string,
                icon: 'bell-off-outline',
                value: dndAttr.currentValue === true,
                onToggle: val => handleUpdateAttribute(primaryEntity.code, 'do_not_disturb', val),
              })}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
