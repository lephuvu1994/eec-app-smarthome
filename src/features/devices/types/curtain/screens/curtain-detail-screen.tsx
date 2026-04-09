import type { TMenuElement } from '@/components/ui/zeego-native-menu';

import { FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation, useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { IS_ANDROID, Text, TouchableOpacity, View } from '@/components/ui';
import { BellIcon } from '@/components/ui/icons';
import { useModal } from '@/components/ui/modal';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import { TimelinePopover } from '@/features/devices/automation/timeline/timeline-popover';
import { DeviceActionBar } from '@/features/devices/common/components/device-action-bar';
import { EDoorState, useShutterControl } from '@/features/devices/types/curtain/hooks/use-shutter-control';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';
import { CurtainBleModal } from '../components/curtain-ble-modal';
import { CurtainMotorConfigModal } from '../components/curtain-motor-config-modal';
import { CurtainMotorDirModal } from '../components/curtain-motor-dir-modal';
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
          primary ? 'size-[88px] bg-[#1B1B1B] dark:bg-white' : 'size-[68px] bg-white dark:border dark:border-[#292929] dark:bg-[#FFFFFF0D]'
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
  const router = useRouter();
  const { theme } = useUniwind();
  const navigation = useNavigation();
  const headerOffset = useHeaderOffset();
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
    handleRfLearnClear,
    rfLearnStatus,
    setRfLearnStatus,
    handleConfig,
    handleMotorDir,
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
  const motorDirModal = useModal();

  const menuElements: TMenuElement[] = React.useMemo(() => [
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
      items: IS_ANDROID
        ? [
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
                  icon: { ios: 'slider.horizontal.below.rectangle' },
                  onPress: motorConfigModal.present,
                },
                {
                  key: 'motor_dir',
                  title: translate('deviceDetail.shutter.advanced.motorDir'),
                  icon: { ios: 'arrow.triangle.2.circlepath' },
                  onPress: motorDirModal.present,
                },
              ],
            },
            {
              key: 'device_type',
              title: translate('deviceDetail.shutter.deviceType'),
              icon: { ios: 'cube.box' },
              onPress: modal.present,
            },
          ]
        : [
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
                      icon: { ios: 'slider.horizontal.below.rectangle' },
                      onPress: motorConfigModal.present,
                    },
                    {
                      key: 'motor_dir',
                      title: translate('deviceDetail.shutter.advanced.motorDir'),
                      icon: { ios: 'arrow.triangle.2.circlepath' },
                      onPress: motorDirModal.present,
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
  ], [deviceId, router, bleModal, rfLearnModal, motorConfigModal, motorDirModal, modal]);

  const iconColor = isDark ? '#FFF' : '#1B1B1B';

  // State dot color
  const stateColor = (() => {
    switch (doorState) {
      case EDoorState.Opened: return '#A3E635'; // Xanh lá
      case EDoorState.Closed: return '#EF4444'; // Đỏ
      case EDoorState.Opening: return '#60A5FA'; // Xanh dương
      case EDoorState.Closing: return '#F97316'; // Cam
      default: return '#F59E0B'; // Vàng (stopped)
    }
  })();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={headerTitle}
          tintColor={iconColor}
          leftContent={(
            <HeaderIconButton onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={iconColor} />
            </HeaderIconButton>
          )}
          rightContent={(
            <View className="flex-row items-center gap-2 pr-1">
              <TimelinePopover
                deviceId={deviceId}
                trigger={(
                  <View className="relative size-10 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
                    <BellIcon color={iconColor} />
                  </View>
                )}
              />
              <ZeegoNativeMenu
                elements={menuElements}
                triggerComponent={(
                  <View pointerEvents="none" className="size-10 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
                    <MaterialCommunityIcons name="cog-outline" size={20} color={iconColor} />
                  </View>
                )}
              />
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
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
            onClearLearn={handleRfLearnClear}
            isOnline={isOnline}
          />
          <CurtainMotorConfigModal
            modalRef={motorConfigModal.ref}
            isControlling={isControlling}
            onConfig={handleConfig}
            initialConfig={motorConfig}
          />
          <CurtainMotorDirModal
            modalRef={motorDirModal.ref}
            isControlling={isControlling}
            onSelectDir={handleMotorDir}
          />

          <DeviceActionBar device={device!} entities={[primaryEntity, childLockEntity].filter(Boolean) as any} />
        </View>
      </View>
    </BaseLayout>
  );
}
