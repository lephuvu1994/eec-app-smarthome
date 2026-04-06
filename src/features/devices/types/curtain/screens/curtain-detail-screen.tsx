import type { TMenuElement } from '@/components/ui/zeego-native-menu';

import { FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';

import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import { useNavigation, useRouter } from 'expo-router';
import * as React from 'react';
import { useLayoutEffect, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUniwind } from 'uniwind';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { IS_IOS, Text, View } from '@/components/ui';
import { BellIcon } from '@/components/ui/icons';
import { useModal } from '@/components/ui/modal';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { TimelinePopover } from '@/features/devices/automation/timeline/timeline-popover';
import { DeviceActionBar } from '@/features/devices/common/components/device-action-bar';
import { EDoorState, useShutterControl } from '@/features/devices/types/curtain/hooks/use-shutter-control';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';
import { CurtainBleModal } from '../components/curtain-ble-modal';
import { CurtainMotorConfigModal } from '../components/curtain-motor-config-modal';
import { CurtainRfLearnModal } from '../components/curtain-rf-learn-modal';
import { CurtainSlider } from '../components/curtain-slider';
import { ShutterBackgroundModal } from '../components/shutter-background-modal';
import { ShutterVisualizer } from '../components/shutter-visualizer';

type Props = {
  deviceId: string;
  entityId?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Control Button
// ─────────────────────────────────────────────────────────────────────────────
type TCtrlBtnProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
};

function CtrlButton({ icon, label, onPress, disabled, primary = false }: TCtrlBtnProps) {
  return (
    <TouchableOpacity
      className="items-center gap-2"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        className={`items-center justify-center rounded-full shadow-md ${
          primary ? 'h-[88px] w-[88px] bg-[#1B1B1B] dark:bg-white' : 'h-[68px] w-[68px] bg-white dark:border dark:border-[#292929] dark:bg-[#FFFFFF0D]'
        }`}
      >
        {icon}
      </View>
      <Text className={`text-sm font-medium ${primary ? 'text-[#1B1B1B] dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
export function CurtainDetailScreen({ deviceId, entityId }: Props) {
  const devices = useDeviceStore(s => s.devices);
  const device = devices.find(d => d.id === deviceId);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useUniwind();
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const isDark = theme === ETheme.Dark;

  const primaryEntity = device ? getPrimaryEntities(device)[0] : undefined;
  const activeEntity = entityId ? device?.entities.find(e => e.id === entityId) : undefined;

  const headerTitle = activeEntity
    ? (activeEntity.name || activeEntity.code)
    : (device?.name ?? translate('deviceDetail.shutter.defaultName') as string);

  const {
    position,
    doorState,
    childLock,
    isControlling,
    handleOpen,
    handleClose,
    handleStop,
    handleChildLock,
    handleBleMode,
    handleRfLearnStart,
    handleRfLearnCancel,
    handleRfLearnSave,
    rfLearnStatus,
    setRfLearnStatus,
    handleConfig,
    handlePosition,
    motorConfig,
    isOnline,
    childLockEntity,
  } = useShutterControl(device, primaryEntity);

  // Note: Position is rendered by CurtainSlider directly.

  // Background image & background picker modal
  const modal = useModal();
  const bleModal = useModal();
  const rfLearnModal = useModal();
  const motorConfigModal = useModal();

  const menuElements: TMenuElement[] = useMemo(() => [
    {
      type: 'group',
      key: 'group_edit',
      items: [
        {
          key: 'info',
          title: (translate('deviceDetail.shutter.deviceInfo') || 'Thông tin thiết bị') as string,
          icon: { ios: 'info.circle' },
          onPress: () => router.push(`/device/${deviceId}/info`),
        },
      ],
    },
    {
      type: 'separator',
      key: 'sep_1',
    },
    {
      type: 'group',
      key: 'group_settings',
      items: [
        {
          key: 'settings',
          title: translate('deviceDetail.shutter.settings'),
          icon: { ios: 'gearshape' },
          children: [
            {
              key: 'advanced',
              title: translate('deviceDetail.shutter.advancedMode'),
              icon: { ios: 'slider.horizontal.3' },
              children: [
                {
                  key: 'ble',
                  title: translate('deviceDetail.shutter.advanced.bleMode'),
                  icon: { ios: 'point.3.connected.trianglepath.dotted' },
                  onPress: bleModal.present,
                },
                {
                  key: 'rf_learn',
                  title: translate('deviceDetail.shutter.advanced.rfLearning'),
                  icon: { ios: 'wave.3.left.circle' },
                  onPress: rfLearnModal.present,
                },
                {
                  key: 'motor_config',
                  title: translate('deviceDetail.shutter.advanced.motorConfig'),
                  icon: { ios: 'gear' },
                  onPress: motorConfigModal.present,
                },
              ],
            },
            {
              key: 'device_type',
              title: translate('deviceDetail.shutter.deviceType'),
              icon: { ios: 'cube.box' },
              onPress: modal.present,
            },
          ],
        },
      ],
    },
  ], [deviceId, router, bleModal, rfLearnModal, motorConfigModal, modal]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Animated.View entering={FadeInDown.duration(300)} className="items-center">
          <Text className="text-lg font-semibold text-black dark:text-white" numberOfLines={1}>
            {headerTitle}
          </Text>
        </Animated.View>
      ),
      headerRight: () => (
        <Animated.View entering={FadeInRight.duration(300)} className="flex-row items-center justify-end gap-2">
          <TimelinePopover
            deviceId={deviceId}
            fromRect={{
              x: Dimensions.get('window').width - (BASE_SPACE_HORIZONTAL + 40 + 8 + 50), // 16 (padding right) + 40 (cog width) + 8 (gap) + 40 (bell width) = 104
              y: IS_IOS ? insets.top + 5 : insets.top + 15, // Approximate header content start y
              width: 40,
              height: 40,
            }}
            renderTrigger={(sourceRef, openPopover) => (
              <TouchableOpacity
                ref={sourceRef}
                onPress={openPopover}
                activeOpacity={0.7}
                className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
              >
                <BellIcon color={isDark ? '#FFF' : '#1B1B1B'} />
              </TouchableOpacity>
            )}
          />

          <ZeegoNativeMenu
            elements={menuElements}
            triggerComponent={(
              <View pointerEvents="none" className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                <MaterialCommunityIcons name="cog-outline" size={22} color={isDark ? '#FFF' : '#1B1B1B'} />
              </View>
            )}
          />
        </Animated.View>
      ),
    });
  }, [isDark, isOnline, deviceId, navigation, headerTitle, menuElements, insets.top]);

  // State dot color
  const stateColor
    = doorState === EDoorState.Open
      ? '#A3E635'
      : doorState === EDoorState.Close
        ? '#EF4444'
        : '#F59E0B';

  return (
    <BaseLayout>
      <View className="relative w-full flex-1 bg-[#F5F7FA] dark:bg-[#1B1B1B]" style={{ paddingTop: headerHeight, paddingBottom: insets.bottom }}>
        {isDark && (
          <Image
            source={require('@@/assets/base/background-dark.webp')}
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
        )}
        {/* ── Door Visualization ─────────────────────────────────── */}
        <ShutterVisualizer
          position={position}
          doorState={doorState}
          stateColor={stateColor}
          isOnline={isOnline}
          protocol={device?.protocol}
          rssi={device?.rssi}
          linkquality={device?.linkquality}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Progress Slider ────────────────────────────────── */}
          <View className="w-full">
            <CurtainSlider
              position={position}
              onSlidingComplete={handlePosition}
              disabled={true} // Tạm thời khóa tính năng điều khiển vị trí
            />
          </View>

          {/* ── Child Lock Toggle ──────────────────────────────── */}
          <View className="mt-8 mb-2">
            <TouchableOpacity
              className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 shadow-sm ${childLock ? 'bg-red-500 dark:bg-red-500/80' : 'bg-white dark:border dark:border-[#292929] dark:bg-[#FFFFFF0D]'}`}
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

          {/* ── Control Buttons ────────────────────────────────── */}
          <View className="mt-6 flex-row items-end justify-between">
            <CtrlButton
              icon={<FontAwesome6 name="chevron-down" size={22} color={isDark ? '#fff' : '#1B1B1B'} />}
              label={translate('deviceDetail.shutter.close')}
              onPress={handleClose}
              disabled={isControlling || !isOnline}
            />
            <CtrlButton
              icon={<FontAwesome6 name="pause" size={22} color={isDark ? '#1B1B1B' : '#fff'} />}
              label={translate('deviceDetail.shutter.stop')}
              onPress={handleStop}
              disabled={isControlling || !isOnline}
              primary
            />
            <CtrlButton
              icon={<FontAwesome6 name="chevron-up" size={22} color={isDark ? '#fff' : '#1B1B1B'} />}
              label={translate('deviceDetail.shutter.open')}
              onPress={handleOpen}
              disabled={isControlling || !isOnline}
            />
          </View>

        </ScrollView>

        <ShutterBackgroundModal modalRef={modal.ref} deviceId={deviceId} />
        <CurtainBleModal
          modalRef={bleModal.ref}
          isControlling={isControlling}
          onBleMode={handleBleMode}
        />
        <CurtainRfLearnModal
          modalRef={rfLearnModal.ref}
          isControlling={isControlling}
          rfLearnStatus={rfLearnStatus}
          setRfLearnStatus={setRfLearnStatus}
          onStartLearn={handleRfLearnStart}
          onCancelLearn={handleRfLearnCancel}
          onSaveLearn={handleRfLearnSave}
        />
        <CurtainMotorConfigModal
          modalRef={motorConfigModal.ref}
          isControlling={isControlling}
          onConfig={handleConfig}
          initialConfig={motorConfig}
        />

        <DeviceActionBar device={device!} entities={[primaryEntity, childLockEntity].filter(Boolean) as any} />
      </View>
    </BaseLayout>
  );
}
