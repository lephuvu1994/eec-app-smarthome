import Env from '@env';
import { PermissionsAndroid, Platform } from 'react-native';
import BleManager from 'react-native-ble-manager';

export const CHIP_SERVICE_UUID = Env.EXPO_PUBLIC_BLE_SERVICE_UUID;
export const CHIP_TX_CHAR_UUID = Env.EXPO_PUBLIC_BLE_TX_UUID;
export const CHIP_RX_CHAR_UUID = Env.EXPO_PUBLIC_BLE_RX_UUID;

class BleService {
  private isInitialized = false;

  async init() {
    if (this.isInitialized)
      return;
    await BleManager.start({ showAlert: false });
    this.isInitialized = true;
  }

  /**
   * Chỉ KIỂM TRA quyền hiện tại — KHÔNG xin thêm quyền mới.
   * Trả về true nếu đã đủ quyền để scan BLE, false nếu chưa.
   * Dùng cho background scan: nếu chưa có quyền thì bỏ qua, không hỏi.
   */
  async checkPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const [scan, connect] = await Promise.all([
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN),
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT),
        ]);
        return scan && connect;
      }
      else {
        return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
    }
    // iOS: quyền BLE chỉ hỏi khi gọi BleManager.start(). Nếu đã init thì coi là đã có.
    // Nếu chưa init → chưa có quyền → trả false.
    return this.isInitialized;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED
          && result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
          && result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  }

  async enableBluetooth(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await BleManager.enableBluetooth();
      }
    }
    catch (error) {
      console.warn('Bluetooth not enabled', error);
    }
  }

  async startScan(seconds: number = 5): Promise<void> {
    await this.init();
    await BleManager.scan({
      serviceUUIDs: [CHIP_SERVICE_UUID],
      seconds,
      allowDuplicates: true,
    });
  }

  async stopScan(): Promise<void> {
    await BleManager.stopScan();
  }

  async connect(id: string): Promise<void> {
    await BleManager.connect(id);
  }

  async disconnect(id: string): Promise<void> {
    await BleManager.disconnect(id);
  }

  async retrieveServices(id: string) {
    return await BleManager.retrieveServices(id);
  }

  async requestMTU(id: string, mtu: number = 512): Promise<number> {
    if (Platform.OS === 'android') {
      try {
        return await BleManager.requestMTU(id, mtu);
      }
      catch (error) {
        console.error('Request MTU failed', error);
        return 20; // Default fallback
      }
    }
    return 20; // iOS handles MTU automatically mostly
  }

  async startNotification(id: string): Promise<void> {
    await BleManager.startNotification(id, CHIP_SERVICE_UUID, CHIP_TX_CHAR_UUID);
  }

  async stopNotification(id: string): Promise<void> {
    await BleManager.stopNotification(id, CHIP_SERVICE_UUID, CHIP_TX_CHAR_UUID);
  }

  /**
   * Write encrypted BLE data to chip with chunked transmission.
   *
   * The BL602 firmware detects end-of-message when it receives a chunk < 20 bytes.
   * AES-128-ECB output is always a multiple of 16 bytes; if it also happens to be
   * a multiple of 20 bytes (LCM = 80), every chunk is exactly 20 bytes and the
   * firmware NEVER detects the end → JSON Parse FAIL.
   *
   * Fix: append a 0x00 sentinel byte after the encrypted payload. The chip
   * strips any trailing \0 after decryption (JSON always ends with '}').
   * This guarantees the last BLE write is always < 20 bytes.
   */
  async writeChunked(id: string, data: number[], chunkSize: number = 20): Promise<void> {
    // Append sentinel byte so last chunk is always < chunkSize
    const payload = [...data, 0x00];

    for (let offset = 0; offset < payload.length; offset += chunkSize) {
      const chunk = payload.slice(offset, offset + chunkSize);
      await BleManager.write(id, CHIP_SERVICE_UUID, CHIP_RX_CHAR_UUID, chunk);
      // Small delay to avoid overwhelming BL602 BLE stack
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  async writeWithoutResponse(id: string, data: number[]): Promise<void> {
    // Note: The firmware is configured as `BT_GATT_CHRC_WRITE | BT_GATT_CHRC_WRITE_WITHOUT_RESP`
    // We use writeWithoutResponse for faster transmission usually, or standard write.
    // Firmware has `door_write_handler`.
    await BleManager.write(
      id,
      CHIP_SERVICE_UUID,
      CHIP_RX_CHAR_UUID,
      data,
    );
  }

  // Helper
  bytesToString(bytes: number[]): string {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  }

  /**
   * Wait for a BLE notification on the TX characteristic.
   * Resolves with the received bytes, or rejects on timeout.
   */
  waitForNotification(deviceId: string, timeoutMs: number = 10_000): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        subscription.remove();
        disconnectSub.remove();
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`BLE notification timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const subscription = BleManager.onDidUpdateValueForCharacteristic(
        ({ value, peripheral, characteristic }) => {
          if (
            peripheral === deviceId
            && characteristic.toLowerCase() === CHIP_TX_CHAR_UUID.toLowerCase()
          ) {
            cleanup();
            resolve(value);
          }
        },
      );

      // Fast-fail if peripheral disconnects while waiting
      const disconnectSub = BleManager.onDisconnectPeripheral(
        ({ peripheral }) => {
          if (peripheral === deviceId) {
            cleanup();
            reject(new Error(`Peripheral did disconnect: ${deviceId}`));
          }
        },
      );
    });
  }

  /**
   * Gracefully stop notifications and disconnect, ignoring errors.
   * Used after ACK to cleanly close BLE before chip reboots.
   */
  async gracefulDisconnect(deviceId: string): Promise<void> {
    await this.stopNotification(deviceId).catch(() => {});
    await this.disconnect(deviceId).catch(() => {});
  }
}

export const bleService = new BleService();
