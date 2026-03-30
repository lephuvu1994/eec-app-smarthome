import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { authService } from '@/lib/api/auth/auth.service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined,
  );
  const notificationListenerRef = useRef<Notifications.EventSubscription | null>(null);
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Only register if we are on a physical device. Simulators will fail to get push tokens.
    if (Device.isDevice) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          setExpoPushToken(token);
          // Auto-sync token to backend if available
          authService.updatePushToken(token).catch(console.error);
        }
      });
    }

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }

    notificationListenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle deep links or routing here based on response.notification.request.content.data
      console.log('Notification Response:', response.notification.request.content.data);
    });

    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current.remove();
      }
      if (responseListenerRef.current) {
        responseListenerRef.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    channels,
    notification,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Mặc định',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    const finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      // Tier 1 logic: This hook automatically calls askAsync ONLY ONCE.
      // If we want contextual requesting (only when user toggles), we should not call it here directly.
      // Wait, the specification says: "The app will only request OS-level notification permissions when the user interacts with a notification toggle for the first time".
      // Let's NOT auto ask for permission here. We'll only GET it if it's there.
      // But wait! This function `registerForPushNotificationsAsync` is typically called to GET the token. We can't get the token without permission.
      // So this effect will exit cleanly if permission is not granted.
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'dummy-project-id';
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    }
    catch (e) {
      console.log('Failed to get push token:', e);
    }
  }

  return token;
}

export async function requestPushPermissionManually() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'dummy-project-id';
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}
