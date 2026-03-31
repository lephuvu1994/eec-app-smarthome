import { renderHook, act } from '@testing-library/react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { authService } from '@/lib/api/auth/auth.service';
import { usePushNotifications, requestPushPermissionManually } from './use-push-notifications';

// Mock Expo modules
jest.mock('expo-device', () => ({
  isDevice: true,
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

jest.mock('@/lib/api/auth/auth.service', () => ({
  authService: {
    updatePushToken: jest.fn().mockResolvedValue(true),
  },
}));

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on mount', () => {
    it('should setup notification listeners and unmount cleanly', async () => {
      const mockRemoveReceived = jest.fn();
      const mockRemoveResponse = jest.fn();

      (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemoveReceived });
      (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemoveResponse });

      const { unmount } = renderHook(() => usePushNotifications());

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();

      // Ensure listeners are cleaned up properly
      unmount();

      expect(mockRemoveReceived).toHaveBeenCalled();
      expect(mockRemoveResponse).toHaveBeenCalled();
    });

    it('should register for push notifications and sync to backend if on physical device', async () => {
      // @ts-ignore
      Device.isDevice = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'mock-expo-token-123' });

      const { result } = renderHook(() => usePushNotifications());

      // Let async effect complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'dummy-project-id',
      });
      expect(result.current.expoPushToken).toBe('mock-expo-token-123');
      expect(authService.updatePushToken).toHaveBeenCalledWith('mock-expo-token-123');
    });

    it('should not request token if permission is not granted (will not prompt user automatically)', async () => {
      // @ts-ignore
      Device.isDevice = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });

      renderHook(() => usePushNotifications());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // It shouldn't get the token or prompt
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(authService.updatePushToken).not.toHaveBeenCalled();
    });

    it('should set up Android notification channels if on Android', async () => {
      Platform.OS = 'android';
      (Notifications.getNotificationChannelsAsync as jest.Mock).mockResolvedValue([{ id: 'default', name: 'Mặc định' }]);

      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.channels).toHaveLength(1);
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'default',
        expect.objectContaining({ name: 'Mặc định', importance: 5 })
      );
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
  });
});
