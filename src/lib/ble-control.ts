/**
 * BleCommandQueue — Serializes BLE connect/write/disconnect sequences.
 *
 * BL602 (Ai-WB2) chỉ hỗ trợ 1 kết nối BLE tại một thời điểm.
 * Queue này đảm bảo các lệnh từ nhiều thiết bị chạy tuần tự, không xung đột.
 *
 * Flow cho mỗi command:
 *   connect → retrieveServices → requestMTU → startNotification
 *   → waitForHandshake → encryptPayload → writeChunked → waitForAck
 *   → gracefulDisconnect
 */

import { bleService } from './ble';
import { cryptoService } from './crypto';

// ─── Types ──────────────────────────────────────────────────────────────────

export type BleControlPayload = {
  cmd: string;
  [key: string]: unknown;
};

type BleQueueItem = {
  peripheralId: string;
  payload: BleControlPayload;
  resolve: () => void;
  reject: (e: Error) => void;
};

// ─── BleCommandQueue ────────────────────────────────────────────────────────

class BleCommandQueue {
  private queue: BleQueueItem[] = [];
  private isProcessing = false;

  /**
   * Enqueue một BLE command. Trả về Promise resolve khi command hoàn tất.
   *
   * @param peripheralId  - react-native-ble-manager peripheral ID (UUID từ scan)
   * @param payload       - JSON payload cần gửi đến chip (sẽ được mã hóa AES)
   */
  enqueue(peripheralId: string, payload: BleControlPayload): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.queue.push({ peripheralId, payload, resolve, reject });
      void this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    this.isProcessing = true;

    const item = this.queue.shift()!;
    try {
      await this.executeCommand(item);
      item.resolve();
    }
    catch (e) {
      item.reject(e instanceof Error ? e : new Error(String(e)));
    }
    finally {
      this.isProcessing = false;
      void this.processNext();
    }
  }

  private async executeCommand(item: BleQueueItem): Promise<void> {
    const { peripheralId, payload } = item;

    // 1. Connect
    await bleService.connect(peripheralId);

    try {
      await bleService.retrieveServices(peripheralId);
      await bleService.requestMTU(peripheralId, 512);

      // 2. Subscribe TX để nhận handshake + ACK
      await bleService.startNotification(peripheralId);

      // 3. Handshake — chip gửi { mac, session, nonce, pid, cid } khi CCC enabled
      const handshakeBytes = await bleService.waitForNotification(peripheralId, 8000);
      const handshakeStr = bleService.bytesToString(handshakeBytes);

      let handshake: { session?: number; nonce?: number; mac?: string; pid?: string; cid?: string };
      try {
        handshake = JSON.parse(handshakeStr);
      }
      catch {
        throw new Error(`[BLE] Handshake parse failed: ${handshakeStr}`);
      }

      if (!handshake.session || !handshake.nonce) {
        throw new Error('[BLE] Handshake missing session/nonce');
      }

      // 4. Mã hóa payload bằng AES-128-ECB (cùng key với firmware)
      // cryptoService.encryptAES128ECB dùng EXPO_PUBLIC_BLE_AES_KEY từ env mặc định
      const jsonStr = JSON.stringify(payload);
      const encryptedBytes = cryptoService.encryptAES128ECB(jsonStr);

      // 5. Ghi dữ liệu (chunked 20 bytes, sentinel 0x00 ở cuối)
      await bleService.writeChunked(peripheralId, encryptedBytes);

      // 6. Chờ ACK từ chip { cmd: "ack", status: "ok" }
      const ackBytes = await bleService.waitForNotification(peripheralId, 6000);
      const ackStr = bleService.bytesToString(ackBytes);

      let ack: { status?: string; message?: string };
      try {
        ack = JSON.parse(ackStr);
      }
      catch {
        throw new Error(`[BLE] ACK parse failed: ${ackStr}`);
      }

      if (ack.status !== 'ok') {
        throw new Error(`[BLE] Command rejected: ${ack.message ?? 'unknown'}`);
      }
    }
    finally {
      // Luôn disconnect dù thành công hay fail — chip chỉ hỗ trợ 1 connection
      await bleService.gracefulDisconnect(peripheralId).catch(() => {});
    }
  }

  /** Số lệnh đang chờ trong queue */
  get pendingCount(): number {
    return this.queue.length + (this.isProcessing ? 1 : 0);
  }
}

// Singleton — dùng chung toàn app
export const bleCommandQueue = new BleCommandQueue();

// ─── Helper: map entity code + state → BLE cmd string ───────────────────────

/**
 * Chuyển entityCode + state boolean → cmd string để gửi đến chip.
 * Hiện tại phục vụ switch_door: OPEN/CLOSE.
 * Extendable cho các device type khác.
 */
export function buildBleCmd(entityCode: string, state: boolean): string {
  // switch_door entity: state=true → OPEN, state=false → CLOSE
  // Có thể mở rộng map nếu cần các device khác
  const cmdMap: Record<string, [string, string]> = {
    // [entityCode]: [cmdWhenOn, cmdWhenOff]
    default: ['OPEN', 'CLOSE'],
  };

  const [cmdOn, cmdOff] = cmdMap[entityCode] ?? cmdMap.default;
  return state ? cmdOn : cmdOff;
}
