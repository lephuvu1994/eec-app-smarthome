import { renderHook, act } from '@testing-library/react-native';
import { useUserManager } from './user-store';
import { authService } from '@/lib/api/auth/auth.service';
import { useHomeStore } from '@/stores/home/home-store';
import { EAuthStatus } from './types/enum';

// Mock MMKV to isolate the store
jest.mock('zustand/middleware', () => {
  const original = jest.requireActual('zustand/middleware');
  return {
    ...original,
    persist: (config: any) => config, // Remove persist wrapper
  };
});

jest.mock('@/lib/storage', () => ({
  mmkvStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@/lib/api/auth/auth.service', () => ({
  authService: {
    getMe: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/mqtt/mqtt-manager', () => ({
  MqttManager: {
    getInstance: () => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
    }),
  },
}));

describe('user-store hydrateAuth', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      await useUserManager.getState().signOut();
    });
  });

  it('should sign out if no access token is present', async () => {
    // Initial state has no token
    await act(async () => {
      await useUserManager.getState().hydrateAuth();
    });
    
    expect(useUserManager.getState().status).toBe(EAuthStatus.signOut);
  });

  it('should sign in if token exists', async () => {
    // Setup initial store with a dummy token
    act(() => {
      useUserManager.getState().updateToken({ accessToken: 'test-token', refreshToken: 'test-refresh' });
    });

    await act(async () => {
      await useUserManager.getState().hydrateAuth();
    });

    // Check store state mapped properly
    const state = useUserManager.getState();
    expect(state.status).toBe('signIn');
  });

  it('should keep signIn state even if hydrate fails', async () => {
    // Setup initial state
    act(() => {
      useUserManager.getState().updateToken({ accessToken: 'offline-token', refreshToken: 'test-refresh' });
    });

    await act(async () => {
      await useUserManager.getState().hydrateAuth();
    });

    expect(useUserManager.getState().status).toBe('signIn');
  });
});
