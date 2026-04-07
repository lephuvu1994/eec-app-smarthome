import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, View } from '@/components/ui';
import { DeviceActionBar } from '@/features/devices/common/components/device-action-bar';
import { ColorTab } from '@/features/devices/types/light/components/color-tab';
import { WhiteTab } from '@/features/devices/types/light/components/white-tab';
import { useLightControl } from '@/features/devices/types/light/hooks/use-light-control';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function LightDetailScreen({ deviceId, entityId }: Props) {
  const router = useRouter();
  const navigation = useNavigation();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const iconColor = isDark ? '#FFF' : '#1B1B1B';

  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;

  const primaryEntity = entityId
    ? device?.entities.find(e => e.id === entityId)
    : device ? getPrimaryEntities(device)[0] : undefined;

  const { isOn, brightness, colorTemp, color, handleToggle, handleChangeBrightness, handleChangeColorTemp, handleChangeColor } = useLightControl(device as any, primaryEntity as any);

  const [activeTab, setActiveTab] = useState<'white' | 'color'>('white');

  // If this device model doesn't support color (e.g. LIGHT_CCT), we can force white tab only
  const hasColor = primaryEntity?.attributes?.some(a => a.key === 'color');

  if (!device || !primaryEntity) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">{translate('base.somethingWentWrong')}</Text>
      </View>
    );
  }

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={!hasColor ? device.name : undefined}
          titleComponent={
            hasColor
              ? (
                  <View className="flex-row rounded-full bg-black/10 p-1 dark:bg-white/10">
                    <TouchableOpacity
                      onPress={() => setActiveTab('white')}
                      className={`rounded-full px-4 py-1.5 ${activeTab === 'white' ? 'bg-white shadow-sm dark:bg-[#FFFFFF33]' : ''}`}
                    >
                      <Text className={`font-semibold ${activeTab === 'white' ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>White</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setActiveTab('color')}
                      className={`rounded-full px-4 py-1.5 ${activeTab === 'color' ? 'bg-white shadow-sm dark:bg-[#FFFFFF33]' : ''}`}
                    >
                      <Text className={`font-semibold ${activeTab === 'color' ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>Color</Text>
                    </TouchableOpacity>
                  </View>
                )
              : undefined
          }
          tintColor={iconColor}
          leftContent={(
            <HeaderIconButton onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={iconColor} />
            </HeaderIconButton>
          )}
          rightContent={(
            <View className="flex-row items-center gap-2 pr-1">
              <HeaderIconButton onPress={() => router.push(`/device/${device.id}/settings`)}>
                <View pointerEvents="none" className="size-10 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
                  <MaterialCommunityIcons name="cog-outline" size={20} color={iconColor} />
                </View>
              </HeaderIconButton>
            </View>
          )}
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

        <View style={{ flex: 1, paddingTop: headerOffset + 16 }}>
          {/* Content Tabs */}
          {activeTab === 'white'
            ? (
                <WhiteTab
                  isOn={isOn}
                  brightness={brightness}
                  colorTemp={colorTemp}
                  onToggle={handleToggle}
                  onChangeBrightness={handleChangeBrightness}
                  onChangeColorTemp={handleChangeColorTemp}
                />
              )
            : (
                <ColorTab
                  isOn={isOn}
                  brightness={brightness}
                  color={color}
                  onToggle={handleToggle}
                  onChangeBrightness={handleChangeBrightness}
                  onChangeColor={handleChangeColor}
                />
              )}

          <DeviceActionBar device={device} entities={primaryEntity ? [primaryEntity] : []} />
        </View>
      </View>
    </BaseLayout>
  );
}
