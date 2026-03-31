import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { authService } from '@/lib/api/auth/auth.service';
import { useNotificationStore } from '@/stores/notification';

/**
 * Configure how notifications are displayed when the app is in the foreground.
 * This runs once at module load time (not per-render).
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Passive notification listener hook.
 *
 * Responsibilities:
 * - Set up Android notification channels
 * - Listen for incoming notifications (foreground)
 * - Listen for notification tap responses (deep linking)
 *
 * Does NOT:
 * - Request permissions (that's the Device Info screen's job)
 * - Register push tokens (that's the Device Info screen's job)
 * - Call any backend APIs
 */
export function usePushNotifications() {
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined,
  );
  const notificationListenerRef = useRef<Notifications.EventSubscription | null>(null);
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Set up Android notification channel (idempotent, no API call)
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Mặc định',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Listen for notifications received while app is in foreground
    notificationListenerRef.current = Notifications.addNotificationReceivedListener((n) => {
      setNotification(n);
    });

    // Listen for user tapping on a notification
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle deep links or routing here based on response.notification.request.content.data
      console.log('Notification Response:', response.notification.request.content.data);
    });

    return () => {
      notificationListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, []);

  return { notification };
}

/**
 * Request push notification permission and obtain the Expo push token.
 * This should ONLY be called from a user-initiated action (e.g. toggling a device alert).
 *
 * @returns The Expo push token string, or null if permission was denied or device is not physical.
 */
export async function requestPushPermissionManually(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  }
  catch (e) {
    console.error('Failed to get Expo push token:', e);
    return null;
  }
}

/**
 * Ensure the push token is synced to the server.
 * Called from Device Info screen before enabling per-device notifications.
 *
 * Flow:
 * 1. Request OS permission (prompts user if not yet granted)
 * 2. Get Expo push token
 * 3. Check MMKV store — only call API if token is new/changed
 *
 * @returns true if token is ready, false if user denied permission or on simulator
 */
export async function ensurePushTokenSynced(): Promise<boolean> {
  // 1. Get or request token
  const token = await requestPushPermissionManually();
  if (!token) {
    return false;
  }

  // 2. Check if already synced
  const { lastSyncedToken, setLastSyncedToken } = useNotificationStore.getState();

  if (token === lastSyncedToken) {
    // Already synced, no API call needed
    return true;
  }

  // 3. Sync to server
  try {
    await authService.updatePushToken(token);
    setLastSyncedToken(token);
    return true;
  }
  catch (e) {
    console.error('Failed to sync push token:', e);
    return false;
  }
}
