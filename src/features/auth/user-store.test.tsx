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
  },
}));

jest.mock('@/lib/socket/socket-manager', () => {
  return {
    __esModule: true,
    default: {
      getInstance: () => ({ connect: jest.fn(), disconnect: jest.fn() }),
    },
  };
});

describe('user-store hydrateAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserManager.getState().signOut();
  });

  it('should sign out if no access token is present', async () => {
    // Initial state has no token
    await act(async () => {
      await useUserManager.getState().hydrateAuth();
    });
    
    expect(useUserManager.getState().status).toBe(EAuthStatus.signOut);
  });

  it('should fetch profile, update homes, and sign in if token exists', async () => {
    // Setup initial store with a dummy token
    act(() => {
      useUserManager.getState().updateToken({ accessToken: 'test-token', refreshToken: 'test-refresh' });
    });

    const mockHomes = [
      { id: 'h1', name: 'Home 1', role: 'OWNER' }
    ];
    
    (authService.getMe as jest.Mock).mockResolvedValueOnce({
      user: { id: 'u1', email: 'test@me.com', firstName: 'John' },
      homes: mockHomes
    });

    await act(async () => {
      await useUserManager.getState().hydrateAuth();
    });

    // Check store state mapped properly
    const state = useUserManager.getState();
    expect(state.status).toBe('signIn');
    expect(state.id).toBe('u1');
    expect(state.email).toBe('test@me.com');

    // Check Home store updated correctly
    const homeState = useHomeStore.getState();
    expect(homeState.homes.length).toBe(1);
    expect(homeState.homes[0].ownerId).toBe('u1'); // Mapped correctly
    expect(homeState.selectedHomeId).toBe('h1');
  });

  it('should gracefully fallback to MMKV state if API fails', async () => {
    // Setup initial offline state
    act(() => {
      useUserManager.getState().updateToken({ accessToken: 'offline-token', refreshToken: 'test-refresh' });
    });

    (authService.getMe as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useUserManager.getState().hydrateAuth();
    });

    // Should still signIn using the cached token and state
    expect(useUserManager.getState().status).toBe('signIn');
  });
});
