import type { MqttClient } from 'mqtt';

// ─── Mocks ───────────────────────────────────────────
const mockMqttClient = {
  on: jest.fn(),
  subscribe: jest.fn((_topics: string | string[], cb?: (err?: Error) => void) => cb?.()),
  unsubscribe: jest.fn((_topics: string | string[], cb?: (err?: Error) => void) => cb?.()),
  end: jest.fn((_force?: boolean, _opts?: object, cb?: () => void) => cb?.()),
  connected: true,
  removeAllListeners: jest.fn(),
} as unknown as MqttClient & { on: jest.Mock; connected: boolean };

const mockConnect = jest.fn().mockReturnValue(mockMqttClient);

jest.mock('mqtt', () => ({
  connect: (...args: any[]) => mockConnect(...args),
}));

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(),
    currentState: 'active',
  },
}));

const mockGetMqttCredentials = jest.fn();
jest.mock('@/lib/api/devices/device.service', () => ({
  deviceService: {
    getMqttCredentials: (...args: any[]) => mockGetMqttCredentials(...args),
  },
}));

const MOCK_CREDENTIALS = {
  url: 'wss://test.example.com:8084/mqtt',
  username: 'user_abc123',
  password: 'hmac-signature-hex',
  clientId: 'app_abc123_1711411200000',
};

// ─── Import after mocks ──────────────────────────────
// eslint-disable-next-line ts/no-require-imports
const { MqttManager } = require('./mqtt-manager');

describe('MqttManager', () => {
  let manager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton for each test
    MqttManager.resetInstance?.();
    manager = MqttManager.getInstance();
    mockGetMqttCredentials.mockResolvedValue(MOCK_CREDENTIALS);
    mockMqttClient.connected = true;
  });

  // ═══════════════════════════════════════════════════
  // SINGLETON
  // ═══════════════════════════════════════════════════
  describe('singleton', () => {
    it('should return the same instance', () => {
      const a = MqttManager.getInstance();
      const b = MqttManager.getInstance();
      expect(a).toBe(b);
    });
  });

  // ═══════════════════════════════════════════════════
  // CONNECT
  // ═══════════════════════════════════════════════════
  describe('connect', () => {
    it('should fetch credentials and connect via mqtt.connect', async () => {
      await manager.connect(mockGetMqttCredentials);

      expect(mockGetMqttCredentials).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledWith(MOCK_CREDENTIALS.url, {
        username: MOCK_CREDENTIALS.username,
        password: MOCK_CREDENTIALS.password,
        clientId: MOCK_CREDENTIALS.clientId,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        clean: true,
      });
    });

    it('should not connect if already connected', async () => {
      await manager.connect(mockGetMqttCredentials);
      await manager.connect(mockGetMqttCredentials);

      expect(mockGetMqttCredentials).toHaveBeenCalledTimes(1);
    });

    it('should handle credential fetch failure gracefully', async () => {
      mockGetMqttCredentials.mockRejectedValue(new Error('Network error'));

      await manager.connect(mockGetMqttCredentials);

      expect(mockConnect).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════
  // DISCONNECT
  // ═══════════════════════════════════════════════════
  describe('disconnect', () => {
    it('should end the mqtt client', async () => {
      await manager.connect(mockGetMqttCredentials);
      manager.disconnect();

      expect(mockMqttClient.end).toHaveBeenCalled();
    });

    it('should be safe to call when not connected', () => {
      expect(() => manager.disconnect()).not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════
  // TOPIC SUBSCRIPTION
  // ═══════════════════════════════════════════════════
  describe('subscribeTopics', () => {
    it('should subscribe to device state topics', async () => {
      await manager.connect(mockGetMqttCredentials);

      const devices = [
        { token: 'dev-aaa', id: 'id-1' },
        { token: 'dev-bbb', id: 'id-2' },
      ];
      manager.subscribeDevices(devices);

      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(
        ['+/+/dev-aaa/state', '+/+/dev-aaa/status', '+/+/dev-bbb/state', '+/+/dev-bbb/status'],
        expect.any(Function),
      );
    });

    it('should not subscribe when client is null', () => {
      manager.subscribeDevices([{ token: 'dev-aaa', id: 'id-1' }]);
      expect(mockMqttClient.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribeTopics', () => {
    it('should unsubscribe from device state topics', async () => {
      await manager.connect(mockGetMqttCredentials);

      manager.unsubscribeDevices([{ token: 'dev-aaa', id: 'id-1' }]);

      expect(mockMqttClient.unsubscribe).toHaveBeenCalledWith(
        ['+/+/dev-aaa/state', '+/+/dev-aaa/status'],
        expect.any(Function),
      );
    });
  });

  // ═══════════════════════════════════════════════════
  // MESSAGE HANDLING
  // ═══════════════════════════════════════════════════
  describe('message handling', () => {
    it('should parse topic and emit device event with entity data', async () => {
      await manager.connect(mockGetMqttCredentials);

      // Register device mapping
      manager.subscribeDevices([{ token: 'device-token-xyz', id: 'device-id-123' }]);

      // Capture the 'message' handler from mqtt client
      const messageHandler = mockMqttClient.on.mock.calls.find(
        (call: any[]) => call[0] === 'message',
      )?.[1];

      expect(messageHandler).toBeDefined();

      // Subscribe to device event
      const handler = jest.fn();
      manager.subscribeDeviceState('device:device-id-123', handler);

      // Simulate an incoming MQTT message
      const payload = JSON.stringify({
        entityCode: 'switch_1',
        state: 1,
        attributes: [{ key: 'brightness', value: 80 }],
      });
      messageHandler('COMPANY/MODEL/device-token-xyz/state', Buffer.from(payload));

      expect(handler).toHaveBeenCalledWith({
        entityCode: 'switch_1',
        state: 1,
        attributes: [{ key: 'brightness', value: 80 }],
      });
    });

    it('should handle malformed JSON payload gracefully', async () => {
      await manager.connect(mockGetMqttCredentials);
      manager.subscribeDevices([{ token: 'dev-t', id: 'dev-id' }]);

      const messageHandler = mockMqttClient.on.mock.calls.find(
        (call: any[]) => call[0] === 'message',
      )?.[1];

      const handler = jest.fn();
      manager.subscribeDeviceState('device:dev-id', handler);

      // Should not throw
      expect(() => {
        messageHandler('COMPANY/MODEL/dev-t/state', Buffer.from('not-json'));
      }).not.toThrow();

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle update messages with multiple entity updates', async () => {
      await manager.connect(mockGetMqttCredentials);
      manager.subscribeDevices([{ token: 'dev-t', id: 'dev-id' }]);

      const messageHandler = mockMqttClient.on.mock.calls.find(
        (call: any[]) => call[0] === 'message',
      )?.[1];

      const handler = jest.fn();
      manager.subscribeDeviceState('device:dev-id', handler);

      // Simulate DEVICE_UPDATE with updates array (from iot-gateway handleStateMessage)
      const payload = JSON.stringify({
        deviceId: 'dev-id',
        token: 'dev-t',
        updates: [
          { entityCode: 'switch_1', state: 1, attributes: [] },
          { entityCode: 'dimmer_1', state: 50, attributes: [{ key: 'brightness', value: 50 }] },
        ],
        timestamp: '2026-03-26T00:00:00Z',
      });

      messageHandler('COMPANY/MODEL/dev-t/state', Buffer.from(payload));

      // Should emit for each update
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ entityCode: 'switch_1', state: 1 }),
      );
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ entityCode: 'dimmer_1', state: 50 }),
      );
    });
  });

  // ═══════════════════════════════════════════════════
  // DEVICE STATE EVENT EMITTER
  // ═══════════════════════════════════════════════════
  describe('deviceState event emitter', () => {
    it('should subscribe and unsubscribe to device events', () => {
      const handler = jest.fn();
      manager.subscribeDeviceState('device:d1', handler);
      manager.unsubscribeDeviceState('device:d1', handler);

      // After unsubscribe, no call
      // (internal emitter test — just confirms no throw)
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════
  describe('status', () => {
    it('should report connected status', async () => {
      await manager.connect(mockGetMqttCredentials);
      expect(manager.isConnected()).toBe(true);
    });

    it('should report disconnected when no client', () => {
      expect(manager.isConnected()).toBe(false);
    });

    it('should report disconnected after disconnect()', async () => {
      await manager.connect(mockGetMqttCredentials);
      mockMqttClient.connected = false;
      manager.disconnect();
      expect(manager.isConnected()).toBe(false);
    });
  });
});
