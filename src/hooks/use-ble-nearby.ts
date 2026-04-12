/**
 * useBleNearby — Background BLE scanner.
 *
 * Scan liên tục và match tên BLE "sensa-smart_{MAC12}" với device.identifier từ API.
 * Vì DB lưu identifier không có dấu ':' (AABBCCDDEEFF), match trực tiếp sau khi slice prefix.
 *
 * Trả về: availableBleDevices: Map<deviceId, peripheralId>
 *   - deviceId    = device.id từ API (UUID)
 *   - peripheralId = react-native-ble-manager peripheral UUID (dùng để connect)
 *
 * ⚠️ Hook này KHÔNG xin quyền BLE. Nếu chưa cấp quyền thì bỏ qua hoàn toàn.
 *    Việc request permission chỉ xảy ra ở màn điều khiển BLE khi user chủ động.
 */

import type { TDevice } from '@/types/device';
import { useEffect, useRef, useState } from 'react';
import BleManager from 'react-native-ble-manager';
import { bleService } from '@/lib/ble';

// Prefix khớp với BLE_DEV_NAME_PREFIX trong firmware
const BLE_NAME_PREFIX = 'sensa-smart_';
// Scan lại mỗi 30 giây để cập nhật danh sách thiết bị gần
const SCAN_INTERVAL_MS = 30_000;
// Thời gian mỗi lần scan (giây)
const SCAN_DURATION_SEC = 10;

/**
 * Lấy MAC suffix từ BLE name.
 * "sensa-smart_AABBCCDDEEFF" → "AABBCCDDEEFF"
 */
function extractMacSuffix(bleName: string): string | null {
  if (!bleName.startsWith(BLE_NAME_PREFIX)) {
    return null;
  }

  return bleName.slice(BLE_NAME_PREFIX.length).toUpperCase();
}

export type BleNearbyResult = {
  /** Map<deviceId, peripheralId> — deviceId là UUID từ server API */
  availableBleDevices: Map<string, string>;
};

export function useBleNearby(devices: TDevice[]): BleNearbyResult {
  const [availableBleDevices, setAvailableBleDevices] = useState<Map<string, string>>(
    () => new Map(),
  );
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref snapshot để closure trong listener luôn đọc đúng devices list
  const devicesRef = useRef(devices);
  devicesRef.current = devices;

  useEffect(() => {
    let discoveryListener: ReturnType<typeof BleManager.onDiscoverPeripheral> | null = null;

    const doScan = async () => {
      try {
        // ⚠️ CHỈ check quyền — KHÔNG request, KHÔNG hỏi user.
        // Chưa có quyền thì bỏ qua lặng lẽ. Việc xin quyền được
        // thực hiện ở màn điều khiển BLE khi user chủ động bật.
        const hasPermission = await bleService.checkPermissions();
        if (!hasPermission) {
          return;
        }

        await bleService.init();
        await bleService.startScan(SCAN_DURATION_SEC);
      }
      catch (e) {
        console.warn('[useBleNearby] Scan error:', e);
      }
    };

    // Listener: chạy khi phát hiện peripheral mới trong mỗi lần scan
    discoveryListener = BleManager.onDiscoverPeripheral((peripheral) => {
      // Ưu tiên localName từ advertising (cập nhật hơn cached name)
      const bleName: string = peripheral.advertising?.localName
        ?? peripheral.name
        ?? '';

      const macSuffix = extractMacSuffix(bleName);
      if (!macSuffix) {
        return;
      }

      // Match với device.identifier (đã là AABBCCDDEEFF, không có ':')
      const matched = devicesRef.current.find(
        d => d.identifier.toUpperCase() === macSuffix,
      );
      if (!matched) {
        return;
      }

      // Cập nhật map nếu chưa có hoặc peripheralId thay đổi
      setAvailableBleDevices((prev) => {
        if (prev.get(matched.id) === peripheral.id) {
          return prev; // Không change → không re-render
        }

        const next = new Map(prev);
        next.set(matched.id, peripheral.id);
        return next;
      });
    });

    // Start scan ngay lập tức
    void doScan();

    // Lịch scan định kỳ
    scanIntervalRef.current = setInterval(() => {
      void doScan();
    }, SCAN_INTERVAL_MS);

    return () => {
      discoveryListener?.remove();
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }

      bleService.stopScan().catch(() => {});
    };
  }, []);

  return { availableBleDevices };
}
