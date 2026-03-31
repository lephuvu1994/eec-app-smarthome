import { renderHook } from '@testing-library/react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { usePushNotifications, requestPushPermissionManually, ensurePushTokenSynced } from './use-push-notifications';

// Mock Expo modules
jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        eas: {
          projectId: '75ae721d-f4db-4468-ad91-e5e77831ec57',
        },
      },
    },
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getNotificationChannelsAsync: jest.fn().mockResolvedValue([]),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'expo-token' }),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  AndroidImportance: { MAX: 5 },
}));

// Mock auth service
jest.mock('@/lib/api/auth/auth.service', () => ({
  authService: {
    updatePushToken: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the notification store
const mockSetLastSyncedToken = jest.fn();
jest.mock('@/stores/notification', () => ({
  useNotificationStore: {
    getState: jest.fn(() => ({
      lastSyncedToken: null,
      setLastSyncedToken: mockSetLastSyncedToken,
    })),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { authService } = require('@/lib/api/auth/auth.service');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useNotificationStore } = require('@/stores/notification');

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  describe('passive listener behavior', () => {
    it('should setup notification listeners and unmount cleanly', () => {
      const mockRemoveReceived = jest.fn();
      const mockRemoveResponse = jest.fn();

      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemoveReceived });
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemoveResponse });

      const { unmount } = renderHook(() => usePushNotifications());

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();

      unmount();

      expect(mockRemoveReceived).toHaveBeenCalled();
      expect(mockRemoveResponse).toHaveBeenCalled();
    });

    it('should NOT call getExpoPushTokenAsync or any backend API on mount', () => {
      renderHook(() => usePushNotifications());

      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should set up Android notification channel on Android', () => {
      Platform.OS = 'android';

      renderHook(() => usePushNotifications());

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'default',
        expect.objectContaining({ name: 'Mặc định', importance: 5 }),
      );
    });

    it('should NOT set up Android notification channel on iOS', () => {
      Platform.OS = 'ios';

      renderHook(() => usePushNotifications());

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });
  });

  describe('requestPushPermissionManually', () => {
    it('should return token if already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'manual-token-xyz' });

      const token = await requestPushPermissionManually();

      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      expect(token).toBe('manual-token-xyz');
    });

    it('should request permissions and return token if newly granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'new-token-abc' });

      const token = await requestPushPermissionManually();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(token).toBe('new-token-abc');
    });

    it('should return null if permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const token = await requestPushPermissionManually();

      expect(token).toBeNull();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('should return null if not a physical device', async () => {
      Object.defineProperty(Device, 'isDevice', { value: false, writable: true });

      const token = await requestPushPermissionManually();

      expect(token).toBeNull();

      // Restore
      Object.defineProperty(Device, 'isDevice', { value: true, writable: true });
    });
  });

  describe('ensurePushTokenSynced', () => {
    beforeEach(() => {
      Object.defineProperty(Device, 'isDevice', { value: true, writable: true });
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'expo-token-123' });
    });

    it('should skip API call if token is already synced', async () => {
      useNotificationStore.getState.mockReturnValue({
        lastSyncedToken: 'expo-token-123',
        setLastSyncedToken: mockSetLastSyncedToken,
      });

      const result = await ensurePushTokenSynced();

      expect(result).toBe(true);
      expect(authService.updatePushToken).not.toHaveBeenCalled();
      expect(mockSetLastSyncedToken).not.toHaveBeenCalled();
    });

    it('should call API and update store if token is new', async () => {
      useNotificationStore.getState.mockReturnValue({
        lastSyncedToken: null,
        setLastSyncedToken: mockSetLastSyncedToken,
      });

      const result = await ensurePushTokenSynced();

      expect(result).toBe(true);
      expect(authService.updatePushToken).toHaveBeenCalledWith('expo-token-123');
      expect(mockSetLastSyncedToken).toHaveBeenCalledWith('expo-token-123');
    });

    it('should call API and update store if token has changed', async () => {
      useNotificationStore.getState.mockReturnValue({
        lastSyncedToken: 'old-token-abc',
        setLastSyncedToken: mockSetLastSyncedToken,
      });

      const result = await ensurePushTokenSynced();

      expect(result).toBe(true);
      expect(authService.updatePushToken).toHaveBeenCalledWith('expo-token-123');
      expect(mockSetLastSyncedToken).toHaveBeenCalledWith('expo-token-123');
    });

    it('should return false if permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      const result = await ensurePushTokenSynced();

      expect(result).toBe(false);
      expect(authService.updatePushToken).not.toHaveBeenCalled();
    });
  });
});
