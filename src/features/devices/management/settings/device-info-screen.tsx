import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderBackButton, useHeaderOffset } from '@/components/base/header/CustomHeader';

import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, showErrorMessage, showSuccessMessage, Text, TouchableOpacity, View } from '@/components/ui';
import { RenameDeviceModal } from '@/features/devices/common/modals/rename-device-modal';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { ETheme } from '@/types/base';

type Props = {
  deviceId: string;
};

export function DeviceInfoScreen({ deviceId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerOffset = useHeaderOffset();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const devices = useDeviceStore(s => s.devices);
  const device = devices.find(d => d.id === deviceId);

  const rooms = useHomeDataStore(s => s.rooms);
  const floors = useHomeDataStore(s => s.floors);

  const [renameTarget, setRenameTarget] = React.useState<{ type: 'device' } | { type: 'entity'; code: string; currentName: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const primaryEntities = device ? getPrimaryEntities(device) : [];
  const isSingleHardwareEntity = primaryEntities.length <= 1;

  // ─── Extract Curtain Specific Config ───
  const primaryEntity = primaryEntities[0];
  const configEntity = device?.entities.find(e => e.code === 'config');
  let motorConfig: { clicks?: number; start_time?: string; end_time?: string } | undefined;

  if (configEntity) {
    let rawConfig: any = null;
    if (typeof configEntity.currentState === 'object' && configEntity.currentState) {
      rawConfig = configEntity.currentState;
    }
    else if (typeof configEntity.stateText === 'string' && configEntity.stateText) {
      try {
        rawConfig = JSON.parse(configEntity.stateText);
      }
      catch {
        // ignore
      }
    }
    if (rawConfig) {
      motorConfig = {
        clicks: rawConfig.req_open_clicks ?? rawConfig.clicks,
        start_time: rawConfig.start_time,
        end_time: rawConfig.end_time,
      };
    }
  }

  const travelAttr = primaryEntity?.attributes?.find(a => a.key === 'travel') || configEntity?.attributes?.find(a => a.key === 'travel');
  const travelMs = (travelAttr?.currentValue as number) || (travelAttr?.numValue as number) || 0;

  function formatTravelTime(ms: number) {
    if (!ms)
      return '--';
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FA] dark:bg-neutral-900">
        <Text>{translate('device.info.notFound')}</Text>
      </View>
    );
  }

  const room = rooms.find(r => r.id === device.room?.id);
  const floor = floors.find(f => f.id === room?.floorId);
  const locationText = [room?.name, floor?.name].filter(Boolean).join(' - ');

  const handleRemoveDevice = () => {
    Alert.alert(
      translate('device.remove.title') || 'Gỡ bỏ thiết bị',
      translate('device.remove.confirmMessage') || 'Bạn có chắc chắn muốn gỡ bỏ thiết bị này không? Tất cả thông tin cài đặt và lịch sử hoạt động sẽ bị xoá vĩnh viễn.',
      [
        { text: translate('base.cancel') || 'Huỷ', style: 'cancel' },
        {
          text: translate('device.remove.button') || 'Xoá thiết bị',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deviceService.deleteDevice(device.id);
              showSuccessMessage(translate('device.remove.success') || 'Thiết bị đã được gỡ bỏ');

              // Remove locally for snappier UI before query invalidation triggers
              const currentDevices = useDeviceStore.getState().devices;
              useDeviceStore.setState({ devices: currentDevices.filter(d => d.id !== device.id) });

              // Router navigation to root dashboard
              router.dismissAll();
              router.replace('/');
            }
            catch {
              showErrorMessage(translate('device.remove.error') || 'Lỗi khi gỡ bỏ thiết bị');
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={theme === ETheme.Dark ? require('@@/assets/base/background-dark.webp') : require('@@/assets/base/background-light.webp')}
          style={[{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }, StyleSheet.absoluteFillObject]}
          contentFit="cover"
        />
        {/* ── Header ── */}
        <CustomHeader
          title={(translate('device.info.title') as string) || 'Thông tin thiết bị'}
          tintColor={isDark ? '#FFFFFF' : '#1B1B1B'}
          leftContent={<HeaderBackButton onPress={() => router.back()} color={isDark ? '#FFFFFF' : '#1B1B1B'} />}
        />

        <ScrollView
          className="z-10 flex-1"
          contentContainerStyle={{ paddingTop: headerOffset + 16, paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile Section ── */}
          <View className="mt-4 mb-10 items-center justify-center">
            <View className="size-24 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-md dark:bg-[#1C1C1E]/80">
              <MaterialCommunityIcons name="cube-outline" size={48} color={isDark ? '#fff' : '#1B1B1B'} />
            </View>
            <View className="mt-4 flex-row items-center justify-center gap-2">
              <Text className="text-xl font-bold text-[#1B1B1B] dark:text-white" numberOfLines={1}>
                {device.name}
              </Text>
              <TouchableOpacity onPress={() => setRenameTarget({ type: 'device' })} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            {locationText
              ? (
                  <Text className="mt-1 pb-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {locationText}
                  </Text>
                )
              : null}
          </View>

          {/* ── Additional Device Info (e.g. Curtain Motor Stats) ── */}
          {motorConfig && (
            <View className="mb-6 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur-md dark:bg-[#1C1C1E]/80">
              <Text className="mb-3 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {translate('deviceDetail.shutter.configInfo') || 'Thông tin cài đặt'}
              </Text>
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-1 items-center justify-center rounded-xl bg-black/5 p-3 dark:bg-white/5">
                  <MaterialCommunityIcons name="target" size={20} color="#9CA3AF" />
                  <Text className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {translate('deviceDetail.shutter.operations') || 'Thao tác'}
                  </Text>
                  <Text className="mt-0.5 text-sm font-semibold text-[#1B1B1B] dark:text-white">
                    {motorConfig.clicks ? `${motorConfig.clicks} lần` : '--'}
                  </Text>
                </View>
                <View className="flex-[1.2] items-center justify-center rounded-xl bg-black/5 p-3 dark:bg-white/5">
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#9CA3AF" />
                  <Text className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {translate('deviceDetail.shutter.workingHours') || 'Giờ hoạt động'}
                  </Text>
                  <Text className="mt-0.5 text-sm font-semibold text-[#1B1B1B] dark:text-white" adjustsFontSizeToFit numberOfLines={1}>
                    {motorConfig.start_time && motorConfig.end_time ? `${motorConfig.start_time} - ${motorConfig.end_time}` : '--'}
                  </Text>
                </View>
                <View className="flex-1 items-center justify-center rounded-xl bg-black/5 p-3 dark:bg-white/5">
                  <MaterialCommunityIcons name="timer-outline" size={20} color="#9CA3AF" />
                  <Text className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {translate('deviceDetail.shutter.travelTime') || 'Hành trình'}
                  </Text>
                  <Text className="mt-0.5 text-sm font-semibold text-[#1B1B1B] dark:text-white">
                    {formatTravelTime(travelMs)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Entity List (For Multi-Gang Devices) ── */}
          {!isSingleHardwareEntity && device.entities && device.entities.length > 0 && (
            <View className="mb-6 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur-md dark:bg-[#1C1C1E]/80">
              <Text className="mb-3 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {translate('device.info.entitiesTitle' as any) || 'Danh sách tính năng'}
              </Text>
              <View className="flex-col gap-3">
                {primaryEntities.map(entity => (
                  <View key={entity.code} className="flex-row items-center justify-between rounded-xl bg-black/5 px-4 py-3 dark:bg-white/5">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-[#1B1B1B] dark:text-white" numberOfLines={1}>
                        {entity.name || entity.code}
                      </Text>
                    </View>
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => setRenameTarget({ type: 'entity', code: entity.code, currentName: entity.name || entity.code })}
                    >
                      <View className="rounded-lg bg-white/60 p-2 dark:bg-black/20">
                        <MaterialCommunityIcons name="pencil-outline" size={18} color={isDark ? '#A1A1AA' : '#6B7280'} />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="flex-row flex-wrap justify-between gap-y-4">
            <View className="w-[48%]">
              <PrimarySceneCard
                title="Hỗ trợ điều khiển qua AI"
                containerStyle={{ minHeight: 110, height: 'auto' }}
                bgGradient={['#8B5CF6', '#6D28D9']}
                textColor="#FFFFFF"
                iconBgColor="rgba(255, 255, 255, 0.2)"
                icon={<MaterialCommunityIcons name="robot-outline" size={24} color="#FFFFFF" />}
                showGlossyEffect
                onPress={() => {}}
              />
            </View>
            <View className="w-[48%]">
              <PrimarySceneCard
                title="Cài đặt thông báo"
                containerStyle={{ minHeight: 110, height: 'auto' }}
                cardColor={isDark ? '#1C1C1E' : '#FFFFFF'}
                textColor={isDark ? '#FFFFFF' : '#1B1B1B'}
                iconBgColor={isDark ? '#2C2C2E' : '#F3F4F6'}
                icon={<MaterialCommunityIcons name="bell-ring-outline" size={24} color={isDark ? '#A1A1AA' : '#6B7280'} />}
                onPress={() => router.push(`/device/${device.id}/notifications`)}
              />
            </View>
            <View className="w-[48%]">
              <PrimarySceneCard
                title="Kịch bản liên quan"
                containerStyle={{ minHeight: 110, height: 'auto' }}
                cardColor={isDark ? '#1C1C1E' : '#FFFFFF'}
                textColor={isDark ? '#FFFFFF' : '#1B1B1B'}
                iconBgColor={isDark ? '#2C2C2E' : '#F3F4F6'}
                icon={<MaterialCommunityIcons name="movie-open-outline" size={24} color={isDark ? '#A1A1AA' : '#6B7280'} />}
                onPress={() => {}}
              />
            </View>
            <View className="w-[48%]">
              <PrimarySceneCard
                title="Chia sẻ thiết bị"
                containerStyle={{ minHeight: 110, height: 'auto' }}
                cardColor={isDark ? '#1C1C1E' : '#FFFFFF'}
                textColor={isDark ? '#FFFFFF' : '#1B1B1B'}
                iconBgColor={isDark ? '#2C2C2E' : '#F3F4F6'}
                icon={<MaterialCommunityIcons name="share-variant-outline" size={24} color={isDark ? '#A1A1AA' : '#6B7280'} />}
                onPress={() => {}}
              />
            </View>
          </View>

          {/* ── General Settings ── */}
          <View className="mt-8 mb-4">
            <Text className="mb-3 pl-2 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
              {translate('device.info.generalSettings') || 'Cài đặt chung'}
            </Text>
            <View className="overflow-hidden rounded-2xl bg-white/80 shadow-sm backdrop-blur-md dark:bg-[#1C1C1E]/80">
              {/* Thêm vào màn hình điện thoại */}
              <TouchableOpacity
                className="flex-row items-center justify-between border-b border-black/5 p-4 dark:border-white/5"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="rounded-lg bg-[#3B82F6]/10 p-2 dark:bg-[#3B82F6]/20">
                    <MaterialCommunityIcons name="export-variant" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-base font-medium text-[#1B1B1B] dark:text-white">
                    {translate('device.info.addShortcut') || 'Thêm ra Gọi nhanh (Intent)'}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
              </TouchableOpacity>

              {/* Thông tin Firmware */}
              <TouchableOpacity
                className="flex-row items-center justify-between border-b border-black/5 p-4 dark:border-white/5"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="rounded-lg bg-[#10B981]/10 p-2 dark:bg-[#10B981]/20">
                    <MaterialCommunityIcons name="cellphone-arrow-down" size={20} color="#10B981" />
                  </View>
                  <Text className="text-base font-medium text-[#1B1B1B] dark:text-white">
                    {translate('device.info.updateFirmware') || 'Cập nhật Firmware'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium text-neutral-500">
                    {translate('device.info.latestVersion') || 'Mới nhất'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
                </View>
              </TouchableOpacity>

              {/* Thông tin Partner/Kết nối */}
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="rounded-lg bg-warning-500/10 p-2 dark:bg-warning-500/20">
                    <MaterialCommunityIcons name="lan" size={20} color="#F59E0B" />
                  </View>
                  <Text className="text-base font-medium text-[#1B1B1B] dark:text-white">
                    {translate('device.info.partnerIntegration') || 'Cổng kết nối Partner'}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#A1A1AA' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* ── Fixed Bottom Actions ── */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          className="px-4 pt-2"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-danger-200 bg-danger-50 py-4 dark:border-danger-800 dark:bg-[#EF44441A]"
            onPress={handleRemoveDevice}
            disabled={isDeleting}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#EF4444" />
            <Text className="text-base font-semibold text-danger-500">
              {isDeleting ? 'Đang gỡ bỏ...' : (translate('device.remove.button') || 'Gỡ bỏ thiết bị')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Modals ── */}
        <RenameDeviceModal
          isVisible={!!renameTarget}
          onClose={() => setRenameTarget(null)}
          currentName={renameTarget?.type === 'entity' ? renameTarget.currentName : device.name}
          onSave={async (newName) => {
            if (!renameTarget) {
              return;
            }

            try {
              if (renameTarget.type === 'device') {
                // Rename Device Hardware only
                await deviceService.renameDevice(deviceId, newName);
                useDeviceStore.getState().updateDevice(deviceId, { name: newName });
              }
              else if (renameTarget.type === 'entity') {
                // Rename specific entity
                await deviceService.renameDeviceEntity(deviceId, renameTarget.code, newName);
                useDeviceStore.getState().updateDeviceEntity(deviceId, renameTarget.code, { name: newName });
              }
            }
            catch (error) {
              console.error('Failed to rename:', error);
              showErrorMessage(translate('base.somethingWentWrong') || 'Đổi tên thất bại');
            }
          }}
        />
      </View>
    </BaseLayout>
  );
}
