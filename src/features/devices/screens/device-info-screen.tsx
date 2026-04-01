import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { PrimarySceneCard } from '@/components/base/scene/PrimarySceneCard';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, showErrorMessage, showSuccessMessage, Text, TouchableOpacity, View } from '@/components/ui';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { ETheme } from '@/types/base';
import { RenameDeviceModal } from '../components/modals/rename-device-modal';

type Props = {
  deviceId: string;
};

export function DeviceInfoScreen({ deviceId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FA] dark:bg-neutral-900">
        <Text>Thiết bị không tồn tại.</Text>
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
      <View className="relative w-full flex-1" style={{ paddingBottom: insets.bottom }}>
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
        <View
          className="z-10 flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top, paddingBottom: 8 }}
        >
          <Animated.View entering={FadeInLeft.duration(300)} className="flex-1 items-start">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={isDark ? '#FFF' : '#1B1B1B'} />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(300)} className="flex-2 items-center">
            <Text className="text-lg font-semibold text-black dark:text-white" numberOfLines={1}>
              {translate('device.info.title') || 'Thông tin thiết bị'}
            </Text>
          </Animated.View>
          <View className="flex-1" />
        </View>

        <ScrollView
          className="z-10 flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
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
                  <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {locationText}
                  </Text>
                )
              : null}
          </View>

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

          {/* ── Remove Device Button ── */}
          <View className="mt-8 mb-4">
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
          </View>
        </ScrollView>

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
