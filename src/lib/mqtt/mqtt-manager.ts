import type { MqttClient } from 'mqtt';
import type { AppStateStatus } from 'react-native';

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import mqtt from 'mqtt/dist/mqtt';
import { AppState } from 'react-native';

// ── Inline type so we don't import deviceService (avoids require cycle) ──
export type TMqttCredentials = {
  url: string;
  username: string;
  password: string;
  clientId: string;
};

// ============================================================
// TYPES
// ============================================================
export enum EMqttStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
}

type DeviceMapping = {
  token: string;
  id: string;
};

// Lightweight event emitter (no external dep)
type Listener = (...args: any[]) => void;

class DeviceEventEmitter {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, fn: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
  }

  off(event: string, fn: Listener): void {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }
}

// ============================================================
// MQTT MANAGER (Singleton)
// ============================================================
export class MqttManager {
  private static instance: MqttManager;
  private client: MqttClient | null = null;

  // Per-device state events: `device:${deviceId}`
  private deviceEmitter = new DeviceEventEmitter();

  private status: EMqttStatus = EMqttStatus.DISCONNECTED;
  private isAppActive = true;

  // Stored fetcher so reconnect from background can re-use it
  private credentialsFetcher: (() => Promise<TMqttCredentials>) | null = null;

  // token → deviceId mapping for incoming messages
  private tokenToDeviceId = new Map<string, string>();

  private constructor() {
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  static getInstance(): MqttManager {
    if (!MqttManager.instance) {
      MqttManager.instance = new MqttManager();
    }
    return MqttManager.instance;
  }

  /**
   * @internal
   */
  static resetInstance(): void {
    if (MqttManager.instance) {
      MqttManager.instance.disconnect();
    }
    MqttManager.instance = undefined as any;
  }

  // ─── App State ─────────────────────────────────────
  private handleAppStateChange(nextAppState: AppStateStatus) {
    const wasActive = this.isAppActive;
    this.isAppActive = nextAppState === 'active';

    if (this.isAppActive && !wasActive) {
      // Returning from background — reconnect with stored fetcher
      if (!this.isConnected() && this.credentialsFetcher) {
        this.connect(this.credentialsFetcher);
      }
    }
  }

  // ─── Connect ───────────────────────────────────────
  /**
   * Connect to MQTT broker.
   * @param credentialsFetcher - Async function that returns MQTT credentials.
   *   Passed from outside so mqtt-manager doesn't import deviceService directly
   *   (avoids the user-store → mqtt-manager → deviceService → client → user-store cycle).
   */
  async connect(credentialsFetcher: () => Promise<TMqttCredentials>): Promise<void> {
    if (this.client?.connected) {
      return;
    }

    // Store fetcher for background reconnect
    this.credentialsFetcher = credentialsFetcher;
    this.status = EMqttStatus.CONNECTING;

    try {
      const credentials = await credentialsFetcher();

      this.client = mqtt.connect(credentials.url, {
        username: credentials.username,
        password: credentials.password,
        clientId: credentials.clientId,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        clean: true,
      });

      this.client?.on('connect', () => {
        this.status = EMqttStatus.CONNECTED;
        console.log('📡 MQTT connected:', credentials.clientId);

        // Re-subscribe to all tracked devices
        if (this.tokenToDeviceId.size > 0) {
          const topics = Array.from(this.tokenToDeviceId.keys()).map(
            token => `+/+/${token}/state`,
          );
          this.client?.subscribe(topics, () => {});
        }
      });

      this.client!.on('disconnect', () => {
        this.status = EMqttStatus.DISCONNECTED;
        console.log('📡 MQTT disconnected');
      });

      this.client!.on('reconnect', () => {
        this.status = EMqttStatus.RECONNECTING;
        console.log('📡 MQTT reconnecting...');
      });

      this.client!.on('error', (err: any) => {
        console.warn('📡 MQTT error:', err.message);
      });

      this.client!.on('message', (topic: string, payload: Uint8Array) => {
        this.handleMessage(topic, payload);
      });
    }
    catch (error: any) {
      this.status = EMqttStatus.DISCONNECTED;
      console.error('📡 MQTT connect failed:', error?.message);
    }
  }

  // ─── Disconnect ────────────────────────────────────
  disconnect(): void {
    if (this.client) {
      this.client.removeAllListeners();
      this.client.end(true);
      this.client = null;
    }
    this.status = EMqttStatus.DISCONNECTED;
    this.tokenToDeviceId.clear();
  }

  // ─── Subscribe Devices ─────────────────────────────
  subscribeDevices(devices: DeviceMapping[]): void {
    if (!this.client) {
      return;
    }

    const topics: string[] = [];
    for (const device of devices) {
      this.tokenToDeviceId.set(device.token, device.id);
      topics.push(`+/+/${device.token}/state`);
    }

    if (topics.length > 0) {
      this.client.subscribe(topics, () => {});
    }
  }

  // ─── Unsubscribe Devices ───────────────────────────
  unsubscribeDevices(devices: DeviceMapping[]): void {
    if (!this.client) {
      return;
    }

    const topics: string[] = [];
    for (const device of devices) {
      this.tokenToDeviceId.delete(device.token);
      topics.push(`+/+/${device.token}/state`);
    }

    if (topics.length > 0) {
      this.client.unsubscribe(topics, () => {});
    }
  }

  // ─── Message Handling ──────────────────────────────
  private handleMessage(topic: string, payload: Uint8Array): void {
    // Extract device token from topic: "COMPANY/MODEL/{token}/state"
    const parts = topic.split('/');
    if (parts.length < 4) {
      return;
    }

    const token = parts[2];
    const deviceId = this.tokenToDeviceId.get(token);
    if (!deviceId) {
      return;
    }

    try {
      const data = JSON.parse(payload.toString());

      // Format 1: Batch updates from iot-gateway handleStateMessage
      // { deviceId, token, updates: [{ entityCode, state, attributes }], timestamp }
      if (Array.isArray(data.updates)) {
        for (const update of data.updates) {
          this.deviceEmitter.emit(`device:${deviceId}`, update);
        }
        return;
      }

      // Format 2: Single entity update
      // { entityCode, state, attributes }
      if (data.entityCode) {
        this.deviceEmitter.emit(`device:${deviceId}`, data);
        return;
      }

      // Format 3: Raw flat state (fallback) — emit as-is
      this.deviceEmitter.emit(`device:${deviceId}`, data);
    }
    catch {
      // Malformed JSON — skip silently
      console.warn('📡 MQTT: malformed payload on topic', topic);
    }
  }

  // ─── Device State Events (per-device dispatch) ─────
  subscribeDeviceState(event: string, callback: (data: any) => void): void {
    this.deviceEmitter.on(event, callback);
  }

  unsubscribeDeviceState(event: string, callback: (data: any) => void): void {
    this.deviceEmitter.off(event, callback);
  }

  // ─── Status ────────────────────────────────────────
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  getStatus(): EMqttStatus {
    return this.status;
  }
}
