import type { TMenuElement } from '@/components/ui/zeego-native-menu';

import { FontAwesome5, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import { EDoorState, useShutterControl } from '@/features/devices/hooks/use-shutter-control';
import { EDeviceStatus } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';
import { CurtainSlider } from '../components/curtain-slider';
import { CurtainBleModal } from '../components/modals/curtain-ble-modal';
import { CurtainMotorConfigModal } from '../components/modals/curtain-motor-config-modal';
import { CurtainRfLearnModal } from '../components/modals/curtain-rf-learn-modal';
import { ShutterBackgroundModal } from '../components/modals/shutter-background-modal';
import { getShutterBackgroundSource } from '../utils/shutter-constants';

type Props = {
  deviceId: string;
  entityId?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format travelMs → "X phút Y giây"
// ─────────────────────────────────────────────────────────────────────────────
function formatTravelTime(ms: number): string {
  if (!ms) {
    return '--';
  }
  const sec = Math.round(ms / 1000);
  if (sec < 60) {
    return `${sec}s`;
  }
  const min = Math.floor(sec / 60);
  const remain = sec % 60;
  return remain > 0 ? `${min}p ${remain}s` : `${min} phút`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card (bottom info cards)
// ─────────────────────────────────────────────────────────────────────────────
type TStatCardProps = { icon: React.ReactNode; value: string; label: string };

function StatCard({ icon, value, label }: TStatCardProps) {
  return (
    <View className="flex-1 items-center justify-center gap-1 rounded-2xl bg-white px-2 py-3 shadow-sm dark:border dark:border-[#292929] dark:bg-[#FFFFFF0D]">
      {icon}
      <Text className="text-base font-bold text-[#1B1B1B] dark:text-white">{value}</Text>
      <Text className="text-center text-[10px] text-neutral-400 dark:text-neutral-500" numberOfLines={1}>{label}</Text>
    </View>
  );
}

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
  const navigation = useNavigation();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const primaryEntity = entityId
    ? device?.entities.find(e => e.id === entityId)
    : device ? getPrimaryEntities(device)[0] : undefined;

  const {
    position,
    doorState,
    childLock,
    travelMs,
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
  } = useShutterControl(device, primaryEntity);

  // Note: Position is rendered by CurtainSlider directly.

  // Background image & background picker modal
  const backgroundId = useConfigManager(s => s.shutterBackgrounds[deviceId]) || '1';
  const bgSource = getShutterBackgroundSource(backgroundId);
  const modal = useModal();
  const bleModal = useModal();
  const rfLearnModal = useModal();
  const motorConfigModal = useModal();

  const isOnline = device?.status === EDeviceStatus.ONLINE;

  const menuElements: TMenuElement[] = [
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
                  icon: { ios: 'bluetooth' },
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
    {
      type: 'separator',
      key: 'sep_1',
    },
    {
      type: 'group',
      key: 'group_edit',
      items: [
        {
          key: 'rename',
          title: translate('deviceDetail.shutter.rename'),
          icon: { ios: 'pencil' },
          onPress: () => {
            console.log('Rename Device');
          },
        },
      ],
    },
  ];

  // State dot color
  const stateColor
    = doorState === EDoorState.Open
      ? '#A3E635'
      : doorState === EDoorState.Close
        ? '#EF4444'
        : '#F59E0B';

  return (
    <View className="flex-1 bg-[#F5F7FA] dark:bg-black" style={{ paddingBottom: insets.bottom }}>
      {/* ── Custom Header (same pattern as RoomDetailScreen) ── */}
      <View
        className="flex-row items-center justify-between bg-white px-4 dark:bg-neutral-900"
        style={{ paddingTop: insets.top, paddingBottom: 8 }}
      >
        <Animated.View entering={FadeInLeft.duration(300)} className="flex-1 items-start">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={isDark ? '#FFF' : '#1B1B1B'} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300)} className="flex-2 items-center">
          <Text className="text-lg font-semibold text-black dark:text-white" numberOfLines={1}>
            {device?.name ?? translate('deviceDetail.shutter.defaultName')}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInRight.duration(300)} className="flex-1 flex-row items-center justify-end gap-2">
          <TouchableOpacity
            onPress={() => console.log('History Log')}
            activeOpacity={0.7}
            className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={isDark ? '#FFF' : '#1B1B1B'} />
          </TouchableOpacity>

          <ZeegoNativeMenu
            elements={menuElements}
            triggerComponent={(
              <TouchableOpacity
                activeOpacity={0.7}
                className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
              >
                <MaterialCommunityIcons name="cog-outline" size={22} color={isDark ? '#FFF' : '#1B1B1B'} />
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </View>
      {/* ── Door Image ─────────────────────────────────────── */}
      <View className="aspect-4/3 w-full overflow-hidden bg-[#F5F7FA] dark:bg-black">
        <Image source={bgSource} style={{ width: '100%', height: '100%' }} contentFit="cover" />

        {/* State overlay pill (Left) */}
        <View className="absolute bottom-4 left-4 flex-row items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 shadow-sm">
          <View className="size-2 rounded-full" style={{ backgroundColor: stateColor }} />
          <Text className="text-xs font-semibold text-white uppercase shadow-sm">{doorState}</Text>
        </View>

        {/* Online/Offline pill (Right) */}
        <View className="absolute right-4 bottom-4 flex-row items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 shadow-sm">
          <View className={`size-2 rounded-full ${isOnline ? 'bg-[#10B981]' : 'bg-neutral-500'}`} />
          <Text className="text-xs font-semibold text-white shadow-sm">
            {isOnline ? translate('base.online') : translate('base.offline')}
          </Text>
        </View>
      </View>

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

        {/* ── Control Buttons ────────────────────────────────── */}
        <View className="mt-8 flex-row items-end justify-between">
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

        {/* ── Child Lock Toggle ──────────────────────────────── */}
        <View className="mt-6">
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

        {/* ── Footer Stats ───────────────────────────────────── */}
        <View className="mt-4 flex-row gap-2">
          <StatCard
            icon={<FontAwesome6 name="crosshairs" size={18} color="#9CA3AF" />}
            value="--"
            label={translate('deviceDetail.shutter.operations')}
          />
          <StatCard
            icon={<FontAwesome6 name="clock" size={18} color="#9CA3AF" />}
            value="--"
            label={translate('deviceDetail.shutter.workingHours')}
          />
          <StatCard
            icon={<MaterialCommunityIcons name="timer-outline" size={18} color="#9CA3AF" />}
            value={formatTravelTime(travelMs)}
            label={translate('deviceDetail.shutter.travelTime')}
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
    </View>
  );
}
