import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authService } from '@/lib/api/auth/auth.service';
import { mmkvStorage } from '@/lib/storage';
import { createSelectors } from '@/lib/utils';

// ============================================================
// GLOBAL NOTIFICATION CONFIGURATION
// ============================================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ============================================================
// TYPES
// ============================================================
type TNotificationStoreState = {
  /** The local active Expo Push Token */
  token: string | null;
  /** Whether the user has granted push notification permissions */
  hasPermission: boolean;
  /** Whether the token has been successfully synced to our backend */
  isSynced: boolean;
  /** Interlock to prevent concurrent sync calls */
  isSyncing: boolean;

  /** Initialize listeners, channels, and perform a background passive sync check */
  init: () => Promise<void>;
  /** Proactively request permission (if not granted) and force sync token */
  requestPermissionAndSync: () => Promise<boolean>;
  /** Remove token from backend & clear local token state */
  clearToken: () => Promise<void>;
};

// ============================================================
// STORE (Persisted via MMKV)
// ============================================================
const _useNotificationStore = create<TNotificationStoreState>()(
  persist(
    (set, get) => ({
      token: null,
      hasPermission: false,
      isSynced: false,
      isSyncing: false,

      init: async () => {
        // Only run token fetching on physical devices later, but allow permission checks on simulator

        // 1. Setup Android Channels (idempotent)
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Mặc định',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        // 2. Check current permissions without prompting
        const { status } = await Notifications.getPermissionsAsync();
        const hasPermission = status === 'granted';
        set({ hasPermission });

        if (!hasPermission) {
          return;
        }

        // 3. Try passive sync if not yet synced locally but permitted
        const { isSynced, isSyncing } = get();
        if (!isSynced && !isSyncing) {
          try {
            if (!Device.isDevice) {
              set({ isSynced: true, isSyncing: false });
              return;
            }

            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            const expoTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            const token = expoTokenData.data;

            set({ isSyncing: true });
            await authService.updatePushToken(token);
            set({ token, isSynced: true, isSyncing: false });
          }
          catch (e) {
            console.warn('[NotificationStore] Passive sync failed:', e);
            set({ isSyncing: false });
          }
        }
      },

      requestPermissionAndSync: async () => {
        // Wait on physical device checks until AFTER permissions are asked

        const state = get();
        if (state.isSyncing) {
          // If a sync is already in flight, wait politely or just act gracefully.
          // In a precise implementation, we could return a promise, but returning
          // the current synced status immediately helps debounce rapid UI thrashing.
          return state.isSynced;
        }

        try {
          set({ isSyncing: true });

          // 1. Request Permission
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          const hasPermission = finalStatus === 'granted';
          set({ hasPermission });

          if (!hasPermission) {
            set({ isSyncing: false });
            return false;
          }

          // If already perfectly synced and we have a token, skip asking Expo again!
          if (state.isSynced && state.token) {
            set({ isSyncing: false });
            return true;
          }

          if (!Device.isDevice) {
            console.warn('[NotificationStore] Mocking Push Token sync on Simulator.');
            set({ isSynced: true, isSyncing: false });
            return true;
          }

          // 2. Get Expo Token
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          const expoTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          const token = expoTokenData.data;

          // 3. Sync to API if token changed or not marked as synced
          if (token !== state.token || !state.isSynced) {
            try {
              await authService.updatePushToken(token);
              set({ token, isSynced: true, isSyncing: false });
            }
            catch (apiError) {
              set({ isSyncing: false, isSynced: false });
              throw apiError; // Throw so the UI can catch it as a Network/Server error
            }
          }
          else {
            set({ isSyncing: false });
          }

          return true;
        }
        catch (e) {
          // Identify if it's the Api error we re-threw
          if (e && typeof e === 'object' && 'isAxiosError' in e) {
            throw e;
          }
          console.error('[NotificationStore] OS Permission/token error:', e);
          set({ isSyncing: false, isSynced: false });
          return false;
        }
      },

      clearToken: async () => {
        try {
          await authService.updatePushToken(null);
        }
        catch (e) {
          console.error('[NotificationStore] Failed to clear token API:', e);
        }
        finally {
          set({ token: null, isSynced: false, hasPermission: false });
        }
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Mute 'isSyncing' property so it doesn't get persisted and stuck as true
      partialize: state => ({
        token: state.token,
        hasPermission: state.hasPermission,
        isSynced: state.isSynced,
      }),
    },
  ),
);

// Global foreground listener that binds outside React components to avoid stale closures
Notifications.addNotificationReceivedListener((notification) => {
  // Do your global handling here if necessary
  console.log('[NotificationStore] Foreground Notification Received:', notification.request.identifier);
});

Notifications.addNotificationResponseReceivedListener((response) => {
  // Handle action/tap later here (e.g. routing logic)
  console.log('[NotificationStore] Notification Response:', response.notification.request.content.data);
});

export const useNotificationStore = createSelectors(_useNotificationStore);
