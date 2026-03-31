import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { authService } from '@/lib/api/auth/auth.service';
import { useNotificationStore } from '@/stores/notification';

/**
 * Silent push token sync hook.
 *
 * Runs once on app launch (in _layout.tsx) to ensure the server has a fresh token.
 * Does NOT prompt the user for permissions — only checks if already granted.
 *
 * Scenarios:
 * - Token unchanged → no API call (99% of launches)
 * - Token rotated (rare) → sync to server
 * - App reinstalled (MMKV cleared) → sync to server
 * - Permission not granted → do nothing
 */
export function usePushTokenSync() {
  useEffect(() => {
    silentSyncPushToken();
  }, []);
}

async function silentSyncPushToken() {
  try {
    // 1. Only works on physical devices
    if (!Device.isDevice) {
      return;
    }

    // 2. Check OS permission passively (no prompt)
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    // 3. Get current token silently
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const currentToken = tokenData.data;

    // 4. Compare with locally stored token
    const { lastSyncedToken, setLastSyncedToken } = useNotificationStore.getState();

    if (currentToken === lastSyncedToken) {
      // Token hasn't changed — skip API call
      return;
    }

    // 5. Token is new or changed — sync to server
    await authService.updatePushToken(currentToken);
    setLastSyncedToken(currentToken);
  }
  catch (e) {
    // Silent failure — don't disrupt app launch
    console.error('[PushTokenSync] Silent sync failed:', e);
  }
}
