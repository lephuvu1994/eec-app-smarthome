import { act, renderHook } from '@testing-library/react-native';
import { useDeviceControl } from './use-device-control';
import type { TDeviceConfig } from '../types';
import { EDeviceStatus, type TDevice, type TDeviceEntity } from '@/lib/api/devices/device.service';
import { useDeviceEvent } from '@/hooks/use-device-event';
import * as Haptics from 'expo-haptics';

jest.mock('@/lib/api/devices/device.service', () => ({
  deviceService: {
    setEntityValue: jest.fn().mockResolvedValue({}),
  },
  EDeviceStatus: { ONLINE: 'online', OFFLINE: 'offline' }
}));

// Mock dependencies
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}));

jest.mock('@/hooks/use-device-event', () => ({
  useDeviceEvent: jest.fn(),
}));

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}), { virtual: true });

jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

jest.mock('@/stores/config/config', () => ({
  useConfigManager: jest.fn(() => false), // allowHaptics = false
}));

jest.mock('@/lib/i18n', () => ({
  translate: (key: string) => key,
}));

jest.mock('react-native-reanimated', () => ({
  useDerivedValue: jest.fn((cb) => ({ value: cb() })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((val) => val),
  withSpring: jest.fn((val) => val),
  interpolate: jest.fn(),
  interpolateColor: jest.fn(),
  Extrapolation: { CLAMP: 'clamp' },
}));

describe('useDeviceControl', () => {
  const mockModal = { present: jest.fn(), dismiss: jest.fn() } as any;
  const mockConfig = {
  accentColor: '#3B82F6',
  icon: 'lightbulb',
  hasToggle: true,
} as TDeviceConfig;

  const mockEntity = {
  id: 'entity-1',
  code: 'switch_1',
  domain: 'switch',
  name: 'Switch 1',
  state: 1,
  readOnly: false,
} as TDeviceEntity;
  const mockDevice: TDevice = {
    id: 'd1', name: 'Living Room Light', token: 'token-1',
    status: EDeviceStatus.ONLINE, entities: [mockEntity]
  } as TDevice;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize isOn based on activeEntity or first entity', () => {
    const { result } = renderHook(() =>
      useDeviceControl(mockDevice, undefined, { modal: mockModal, config: mockConfig })
    );

    expect(result.current.isOn).toBe(true);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.entityCount).toBe(1);
    expect(result.current.displayName).toBe('Switch 1');
  });

  it('should format displayName if activeEntity is explicitly provided', () => {
    const { result } = renderHook(() =>
      useDeviceControl(mockDevice, mockEntity, { modal: mockModal, config: mockConfig })
    );

    expect(result.current.displayName).toBe('Switch 1');
  });

  it('should toggle state optimistically when onToggle is called', async () => {
    const { result } = renderHook(() =>
      useDeviceControl(mockDevice, undefined, { modal: mockModal, config: mockConfig })
    );

    expect(result.current.isOn).toBe(true);
    
    await act(async () => {
      // Must await to avoid hitting the 500ms debounce immediately if tests run too fast, but we mock Date.now() or wait
      jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000);
      
      await result.current.onToggle();
    });

    expect(result.current.isOn).toBe(false);
  });

  it('should listen to WebSocket device events to update state', () => {
    let wsCallback: any = null;
    (useDeviceEvent as jest.Mock).mockImplementation((deviceId, cb) => {
      wsCallback = cb;
    });

    const { result } = renderHook(() =>
      useDeviceControl(mockDevice, mockEntity, { modal: mockModal, config: mockConfig })
    );

    // Initial is true (1)
    expect(result.current.isOn).toBe(true);

    // WS Event mapping from device-event structure
    act(() => {
      wsCallback({ entityCode: 'switch_1', state: 0 }); // Turn off
    });

    expect(result.current.isOn).toBe(false);
  });
});
