import type { AppStateStatus } from 'react-native';

import type { Socket } from 'socket.io-client';
import EventEmitter from 'eventemitter3';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';

// ============================================================
// TYPES
// ============================================================
type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

type DeviceUpdatePayload = {
  deviceId: string;
  featureId?: string;
  value: any;
};

// ============================================================
// SOCKET MANAGER (Singleton)
// ============================================================
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;

  // App-level events: connect, disconnect, error, reconnect
  private eventEmitter = new EventEmitter();
  // Per-device state events: `device:${deviceId}`
  private deviceEmitter = new EventEmitter();

  private status: SocketStatus = 'disconnected';
  private isAppActive = true;
  private lastUrl = '';
  private lastToken = '';

  private constructor() {
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // ─── App State ─────────────────────────────────────
  private handleAppStateChange(nextAppState: AppStateStatus) {
    this.isAppActive = nextAppState === 'active';

    if (this.isAppActive) {
      if (!this.isConnected()) {
        this.reconnect();
      }
      this.eventEmitter.emit('appActive');
    }
    // Background: Socket.IO tự reconnect khi app quay lại, không cần disconnect
  }

  // ─── Connect ───────────────────────────────────────
  connect(url: string, accessToken: string) {
    if (this.socket?.connected)
      return;

    this.lastUrl = url;
    this.lastToken = accessToken;
    this.status = 'connecting';

    // Socket.IO: gửi token trong auth handshake → server validate trước khi accept
    this.socket = io(url, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.status = 'connected';
      console.log('🔌 Socket connected:', this.socket?.id);
      this.eventEmitter.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.status = 'disconnected';
      console.log('🔌 Socket disconnected:', reason);
      this.eventEmitter.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.status = 'reconnecting';
      console.warn('🔌 Socket connect error:', error.message);
      this.eventEmitter.emit('error', error);
    });

    // ─── Device state events from server ─────────────
    // Server emit: socket.emit('device:update', { deviceId, featureId, value })
    this.socket.on('device:update', (data: DeviceUpdatePayload) => {
      if (!this.isAppActive)
        return;
      this.deviceEmitter.emit(`device:${data.deviceId}`, data);
    });

    // Server emit: socket.emit('device:status', { deviceId, status })
    this.socket.on('device:status', (data: { deviceId: string; status: string }) => {
      if (!this.isAppActive)
        return;
      this.deviceEmitter.emit(`device:${data.deviceId}:status`, data);
    });
  }

  // ─── Disconnect ────────────────────────────────────
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.status = 'disconnected';
  }

  // ─── Reconnect ─────────────────────────────────────
  private reconnect() {
    if (this.socket?.connected)
      return;
    this.disconnect();
    if (this.lastUrl && this.lastToken) {
      this.connect(this.lastUrl, this.lastToken);
    }
  }

  // ─── Send ──────────────────────────────────────────
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // ─── Device State Events (per-device dispatch) ─────
  emitDeviceState(event: string, data: any) {
    this.deviceEmitter.emit(event, data);
  }

  subscribeDeviceState(event: string, callback: (data: any) => void) {
    this.deviceEmitter.on(event, callback);
  }

  unsubscribeDeviceState(event: string, callback: (data: any) => void) {
    this.deviceEmitter.off(event, callback);
  }

  // ─── App Events ────────────────────────────────────
  subscribe(event: string, callback: (...args: any[]) => void) {
    this.eventEmitter.on(event, callback);
  }

  unsubscribe(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.eventEmitter.off(event, callback);
    }
    else {
      this.eventEmitter.removeAllListeners(event);
    }
  }

  // ─── Status ────────────────────────────────────────
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getStatus(): SocketStatus {
    return this.status;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export default SocketManager;
