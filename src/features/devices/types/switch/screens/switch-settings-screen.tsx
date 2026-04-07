import type { TMenuElement } from '@/components/ui/zeego-native-menu';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
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

type Props = {
  deviceId: string;
};

export function SwitchSettingsScreen({ deviceId }: Props) {
  const router = useRouter();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;
  const updateDeviceEntity = useDeviceStore(s => s.updateDeviceEntity);

  const primaryEntities = device ? getPrimaryEntities(device) : [];

  const powerOnOptions = [
    { label: translate('deviceDetail.settings.options.powerOff') as string, value: 'off' },
    { label: translate('deviceDetail.settings.options.powerOn') as string, value: 'on' },
    { label: translate('deviceDetail.settings.options.powerPrevious') as string, value: 'previous' },
  ];

  const indicatorModeOptions = [
    { label: translate('deviceDetail.settings.indicatorOptions.none') as string, value: 'none' },
    { label: translate('deviceDetail.settings.indicatorOptions.relay') as string, value: 'relay' },
    { label: translate('deviceDetail.settings.indicatorOptions.pos') as string, value: 'pos' },
  ];

  const handleUpdateAttribute = async (entityCode: string, attributeKey: string, value: any) => {
    if (!device)
      return;
    try {
      // Optimistic update
      const entity = device.entities.find(e => e.code === entityCode);
      if (entity) {
        updateDeviceEntity(deviceId, entityCode, { attributes: [{ key: attributeKey, value }] });
      }

      // 1. Identify which commandKey matches this attribute
      const attrConfig = entity?.attributes?.find(attr => attr.key === attributeKey);
      if (!attrConfig || !attrConfig.commandKey) {
        console.warn(`Attribute ${attributeKey} not found or has no commandKey config in blueprint`);
        return;
      }

      const payload = { [attrConfig.commandKey]: value };

      // 2. Call service
      await deviceService.setMultipleEntityValues(device.token, entityCode, payload);
    }
    catch (error) {
      console.error('Failed to update attribute', error);
      // Revert logic should go here on failure
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
              <Text className="text-base font-medium text-black dark:text-white">
                {label}
              </Text>
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

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FA] dark:bg-neutral-900">
        <Text>{translate('device.info.notFound')}</Text>
      </View>
    );
  }

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={translate('deviceDetail.settings.switchTitle') as string}
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

        <ScrollView
          className="z-10 flex-1"
          contentContainerStyle={{ paddingTop: headerOffset + 16, paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {primaryEntities.map((entity, index) => {
            const powerBehaviorAttr = entity.attributes?.find(a => a.key === 'power_on_behavior');
            const indicatorModeAttr = entity.attributes?.find(a => a.key === 'indicator_mode');
            const childLockAttr = entity.attributes?.find(a => a.key === 'child_lock');

            return (
              <Animated.View key={entity.code} entering={FadeInDown.duration(400).delay(index * 100)} className="mb-6">
                <Text className="mb-3 pl-2 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                  {translate('deviceDetail.settings.entityConfig', { name: entity.name || entity.code }) as string}
                </Text>
                <View className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#1C1C1E]">

                  {powerBehaviorAttr && renderDropdownRow({
                    label: translate('deviceDetail.settings.powerOnBehavior') as string,
                    icon: 'power',
                    value: (powerBehaviorAttr.currentValue as string) || 'off',
                    options: powerOnOptions,
                    onSelect: (val: string) => handleUpdateAttribute(entity.code, 'power_on_behavior', val),
                  })}

                  {indicatorModeAttr && renderDropdownRow({
                    label: translate('deviceDetail.settings.indicatorMode') as string,
                    icon: 'led-outline',
                    value: (indicatorModeAttr.currentValue as string) || 'none',
                    options: indicatorModeOptions,
                    onSelect: (val: string) => handleUpdateAttribute(entity.code, 'indicator_mode', val),
                  })}

                  {childLockAttr && renderToggleRow({
                    label: translate('deviceDetail.shutter.childLock') as string,
                    icon: 'lock-outline',
                    value: childLockAttr.currentValue === 'LOCK',
                    onToggle: (val: boolean) => handleUpdateAttribute(entity.code, 'child_lock', val ? 'LOCK' : 'UNLOCK'),
                  })}
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
