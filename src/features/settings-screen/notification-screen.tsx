import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, showSuccessMessage, Text, View } from '@/components/ui';
import { authService } from '@/lib/api/auth/auth.service';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';
import { useNotificationStore } from '@/stores/notification';
import { ETheme } from '@/types/base';

export function NotificationScreen() {
  const { theme } = useUniwind();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const router = useRouter();
  const isDark = theme === ETheme.Dark;

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const devices = useDeviceStore(s => s.devices);

  // Filter devices that have at least one notify config enabled
  const devicesWithAlerts = devices.filter((d) => {
    const notify = d.customConfig?.notify;
    if (!notify) {
      return false;
    }
    return Object.values(notify).includes(true);
  });

  const checkPermission = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
    }
    catch (e) {
      console.error('Failed to check notification permission:', e);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const openSystemSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    }
    else {
      Linking.openSettings();
    }
  };

  const handleDisableAll = () => {
    Alert.alert(
      translate('settings.notification.disableAll'),
      translate('settings.notification.disableAllConfirm'),
      [
        { text: translate('base.cancel'), style: 'cancel' },
        {
          text: translate('settings.notification.disableAll'),
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.updatePushToken(null);
              useNotificationStore.getState().clearToken();
              showSuccessMessage(translate('settings.notification.disableAllSuccess'));
            }
            catch (e) {
              console.error('Failed to disable all notifications:', e);
            }
          },
        },
      ],
    );
  };

  const isGranted = permissionStatus === 'granted';

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={
            isDark
              ? require('@@/assets/base/background-dark.webp')
              : require('@@/assets/base/background-light.webp')
          }
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerHeight + 16, paddingBottom: insets.bottom + 32 }}
        >
          <View className="px-4">
            {/* ── Permission Status ── */}
            <View className="mb-6 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur-md dark:bg-[#1C1C1E]/80">
              <Text className="mb-3 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {translate('settings.notification.permissionSection')}
              </Text>
              <View className="flex-row items-center justify-between rounded-xl bg-black/5 px-4 py-3 dark:bg-white/5">
                <View className="flex-row items-center gap-3">
                  <View className={`size-10 items-center justify-center rounded-full ${isGranted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <MaterialCommunityIcons
                      name={isGranted ? 'bell-check-outline' : 'bell-off-outline'}
                      size={22}
                      color={isGranted ? '#22C55E' : '#EF4444'}
                    />
                  </View>
                  <View>
                    <Text className="text-base font-medium text-[#1B1B1B] dark:text-white">
                      {isGranted
                        ? translate('settings.notification.permissionGranted')
                        : translate('settings.notification.permissionNotGranted')}
                    </Text>
                    <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {translate('settings.notification.pushDescription')}
                    </Text>
                  </View>
                </View>
              </View>
              {!isGranted && (
                <TouchableOpacity
                  className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3"
                  onPress={openSystemSettings}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="cog-outline" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white">
                    {translate('settings.notification.openSystemSettings')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Devices with Alerts ── */}
            <View className="mb-6 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur-md dark:bg-[#1C1C1E]/80">
              <Text className="mb-3 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                {translate('settings.notification.devicesWithAlerts')}
              </Text>
              {devicesWithAlerts.length > 0
                ? (
                    <View className="flex-col gap-3">
                      {devicesWithAlerts.map(d => (
                        <TouchableOpacity
                          key={d.id}
                          className="flex-row items-center gap-3 rounded-xl bg-black/5 px-4 py-3 dark:bg-white/5"
                          onPress={() => router.push(`/devices/${d.id}/info`)}
                          activeOpacity={0.7}
                        >
                          <View className="size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <MaterialCommunityIcons name="cube-outline" size={22} color={isDark ? '#60A5FA' : '#3B82F6'} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-[#1B1B1B] dark:text-white" numberOfLines={1}>
                              {d.name}
                            </Text>
                            <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                              {Object.entries(d.customConfig?.notify || {})
                                .filter(([, v]) => v === true)
                                .map(([k]) => translate(`device.info.notify${k.charAt(0).toUpperCase()}${k.slice(1)}` as any))
                                .join(' · ')}
                            </Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )
                : (
                    <View className="items-center py-6">
                      <View className="mb-3 size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <MaterialCommunityIcons name="bell-outline" size={32} color={isDark ? '#6B7280' : '#9CA3AF'} />
                      </View>
                      <Text className="text-sm text-neutral-400 dark:text-neutral-500">
                        {translate('settings.notification.noDeviceAlerts')}
                      </Text>
                    </View>
                  )}
            </View>

            {/* ── Disable All Button ── */}
            {devicesWithAlerts.length > 0 && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-danger-200 bg-danger-50 py-4 dark:border-danger-800 dark:bg-[#EF44441A]"
                onPress={handleDisableAll}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="bell-off-outline" size={20} color="#EF4444" />
                <Text className="text-base font-semibold text-danger-500">
                  {translate('settings.notification.disableAll')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
