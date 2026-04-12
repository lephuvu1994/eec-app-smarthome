import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { Alert } from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { ScrollView, showErrorMessage, Switch, Text, View } from '@/components/ui';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';
import { useNotificationStore } from '@/stores/notification';
import { ETheme } from '@/types/base';

type Props = {
  deviceId: string;
};

export function DeviceNotificationsScreen({ deviceId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const allowHaptics = useConfigManager(s => s.allowHaptics);

  const devices = useDeviceStore(s => s.devices);
  const device = devices.find(d => d.id === deviceId);

  // Keep a local dict to prevent spamming multiple same-key API calls
  const [updatingKeys, setUpdatingKeys] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!deviceId)
      return;
    let isMounted = true;
    deviceService.getNotifyConfig(deviceId)
      .then((notifyConfig) => {
        if (!isMounted || !notifyConfig)
          return;
        const currentDevice = useDeviceStore.getState().devices.find(d => d.id === deviceId);
        if (!currentDevice)
          return;

        useDeviceStore.getState().updateDevice(deviceId, {
          customConfig: {
            ...(currentDevice.customConfig || {}),
            notify: notifyConfig,
          },
        });
      })
      .catch((e) => {
        console.log('[DeviceNotificationsScreen] Failed to fetch notify config', e);
      });
    return () => {
      isMounted = false;
    };
  }, [deviceId]);

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F5F7FA] dark:bg-neutral-900">
        <Text>Thiết bị không tồn tại.</Text>
      </View>
    );
  }

  const toggleNotify = async (notifyKey: string, nextValue: boolean) => {
    if (updatingKeys[notifyKey])
      return;

    // Local Permission Check
    if (nextValue) {
      const synced = await useNotificationStore.getState().requestPermissionAndSync();
      if (!synced) {
        Alert.alert(
          translate('device.notify.permissionTitle'),
          translate('device.notify.permissionDesc'),
        );
        return;
      }
    }

    if (allowHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // ── Optimistic Update ──
    const previousConfig = { ...(device.customConfig || {}) };
    const previousNotify = { ...(previousConfig.notify || {}) };
    const previousValue = previousNotify[notifyKey] || false;

    setUpdatingKeys(prev => ({ ...prev, [notifyKey]: true }));

    // Inject optimistic state instantly into global store
    useDeviceStore.getState().updateDevice(device.id, {
      customConfig: {
        ...previousConfig,
        notify: {
          ...previousNotify,
          [notifyKey]: nextValue,
        },
      },
    });

    try {
      // Backend call
      await deviceService.updateNotifyConfig(device.id, { [notifyKey]: nextValue });
    }
    catch {
      showErrorMessage(translate('device.notify.syncError') || 'Network error, rolling back.');
      // Rollback optimistic update
      useDeviceStore.getState().updateDevice(device.id, {
        customConfig: {
          ...previousConfig,
          notify: {
            ...previousNotify,
            [notifyKey]: previousValue,
          },
        },
      });
      if (allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    finally {
      setUpdatingKeys(prev => ({ ...prev, [notifyKey]: false }));
    }
  };

  const notificationOptions = [
    { key: 'offline', titleKey: 'device.info.notifyOffline', descKey: 'device.info.notifyOfflineDesc', icon: 'wifi-off' },
    { key: 'online', titleKey: 'device.info.notifyOnline', descKey: 'device.info.notifyOnlineDesc', icon: 'wifi' },
    { key: 'stateChange', titleKey: 'device.info.notifyStateChange', descKey: 'device.info.notifyStateChangeDesc', icon: 'sync' },
    { key: 'thresholdAlert', titleKey: 'device.info.notifyThresholdAlert', descKey: 'device.info.notifyThresholdAlertDesc', icon: 'alert-outline' },
  ] as const;

  return (
    <BaseLayout>
      <View className="relative w-full flex-1" style={{ paddingBottom: insets.bottom }}>

        {/* ── Header ── */}
        <View
          className="z-10 flex-row items-center justify-between px-4 pb-2"
          style={{ paddingTop: insets.top }}
        >
          <Animated.View entering={FadeInLeft.duration(300)} className="flex-1 items-start">
            <View
              className="size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
              onTouchStart={() => router.back()} // simple touchable behavior
            >
              <Feather name="arrow-left" size={24} color={isDark ? '#FFF' : '#1B1B1B'} />
            </View>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(300)} className="flex-2 items-center">
            <Text className="text-lg font-semibold text-black dark:text-white" numberOfLines={1}>
              {translate('device.info.notifyTitle')}
            </Text>
          </Animated.View>
          <View className="flex-1" />
        </View>

        <ScrollView
          className="z-10 flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-4 rounded-2xl bg-white/80 p-6 shadow-sm backdrop-blur-md dark:bg-[#1C1C1E]/80">
            <View className="flex-col gap-6">
              {notificationOptions.map((item) => {
                const isChecked = device?.customConfig?.notify?.[item.key] === true;
                const isUpdating = !!updatingKeys[item.key];

                return (
                  <View key={item.key} className="flex-row items-center justify-between">
                    <View className="flex-1 pr-6">
                      <View className="mb-1 flex-row items-center">
                        <MaterialCommunityIcons name={item.icon as any} size={20} color={isDark ? '#fff' : '#1B1B1B'} style={{ marginRight: 8 }} />
                        <Text className="text-base font-medium text-[#1B1B1B] dark:text-white" numberOfLines={1}>
                          {translate(item.titleKey)}
                        </Text>
                      </View>
                      <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                        {translate(item.descKey)}
                      </Text>
                    </View>
                    <View className="items-center justify-center">
                      <Switch
                        checked={isChecked}
                        onChange={() => toggleNotify(item.key, !isChecked)}
                        disabled={isUpdating}
                        accessibilityLabel={translate(item.titleKey)}
                        activeColor="#A3E635"
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </BaseLayout>
  );
}
