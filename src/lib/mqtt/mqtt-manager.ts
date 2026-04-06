import type { MqttClient } from 'mqtt';
import type { AppStateStatus } from 'react-native';

import * as mqtt from 'mqtt';
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
      // Returning from background
      if (this.client) {
        // OS often kills background TCP sockets silently.
        // Force reconnect regardless of this.client.connected to ensure responsiveness
        (this.client as any).reconnect();
      }
      else if (this.credentialsFetcher) {
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
    if (this.client || this.status === EMqttStatus.CONNECTING) {
      return;
    }

    // Store fetcher for background reconnect
    this.credentialsFetcher = credentialsFetcher;
    this.status = EMqttStatus.CONNECTING;

    try {
      const credentials = await credentialsFetcher();

      // Metro/Babel CommonJS/ESM Interop Fallback
      const mqttConnect = mqtt.connect || (mqtt as any).default?.connect || (mqtt as any).default;
      if (typeof mqttConnect !== 'function') {
        throw new TypeError('MQTT library failed to load connect function');
      }

      this.client = mqttConnect(credentials.url, {
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

        // Dynamically import Zustand store to hydrate all cached devices and subscribe instantly
        try {
          const { useDeviceStore } = require('@/stores/device/device-store');
          const devices = useDeviceStore.getState().devices;
          if (devices && devices.length > 0) {
            this.subscribeDevices(devices.map((d: any) => ({ id: d.id, token: d.token })));
          }
        }
        catch (err) {
          console.warn('[MQTT] Failed to load local device store during connect callback', err);
        }

        // Re-subscribe to all globally tracked devices previously registered
        if (this.tokenToDeviceId.size > 0) {
          const topics = Array.from(this.tokenToDeviceId.keys()).flatMap(
            token => [`device/${token}/state`, `device/${token}/status`],
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

      this.client!.on('message', (topic: string, payload: Uint8Array, packet: any) => {
        this.handleMessage(topic, payload, packet?.retain);
      });
    }
    catch (error: any) {
      this.status = EMqttStatus.DISCONNECTED;
      // Extract meaningful error message from axios or standard error
      const errorMessage = error?.response?.data?.message || error?.message || String(error);
      console.error('📡 MQTT connect failed:', errorMessage);
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
    const topics: string[] = [];
    for (const device of devices) {
      this.tokenToDeviceId.set(device.token, device.id);
      topics.push(`device/${device.token}/state`);
      topics.push(`device/${device.token}/status`);
    }

    if (this.client && topics.length > 0) {
      this.client.subscribe(topics, () => {});
    }
  }

  // ─── Unsubscribe Devices ───────────────────────────
  unsubscribeDevices(devices: DeviceMapping[]): void {
    const topics: string[] = [];
    for (const device of devices) {
      this.tokenToDeviceId.delete(device.token);
      topics.push(`device/${device.token}/state`);
      topics.push(`device/${device.token}/status`);
    }

    if (this.client && topics.length > 0) {
      this.client.unsubscribe(topics, () => {});
    }
  }

  // ─── Message Handling ──────────────────────────────
  private handleMessage(topic: string, payload: Uint8Array, isRetained: boolean = false): void {
    // Extract device token from topic: "device/{token}/status" or "device/{token}/state"
    const parts = topic.split('/');
    if (parts.length < 3 || parts[0] !== 'device') {
      return;
    }

    const token = parts[1];
    const deviceId = this.tokenToDeviceId.get(token);
    if (!deviceId) {
      return;
    }

    try {
      const data = JSON.parse(payload.toString());

      // ★ RETAINED MESSAGE GUARD ─────────────────────────────────────
      // Retained messages are stale broker cache from previous sessions
      // or chip reboots (e.g. "STOPPED/50" boot status). They must NOT
      // overwrite the app's current state which is already correct from
      // the API/store. Only pass through online status for LWT handling.
      if (isRetained) {
        if (data.online !== undefined) {
          this.deviceEmitter.emit(`device:${deviceId}`, {
            online: data.online,
            isRetained: true,
          });
        }
        return;
      }

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

  // ─── Publish (Direct MQTT command) ──────────────────
  /**
   * Publish a message directly to an MQTT topic.
   * Use for lightweight read-only commands (e.g. get_status)
   * that don't need to go through the REST API pipeline.
   */
  publish(topic: string, payload: string): void {
    if (this.client?.connected) {
      this.client.publish(topic, payload);
    }
    else {
      console.warn('📡 MQTT: cannot publish, not connected');
    }
  }

  // ─── Status ────────────────────────────────────────
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  getStatus(): EMqttStatus {
    return this.status;
  }
}
