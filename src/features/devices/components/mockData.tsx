import type { TDevice } from '@/lib/api/devices/device.service';
import { EDeviceProtocol, EDeviceStatus, EOwnership } from '@/lib/api/devices/device.service';

// ============================================================
// MOCK DEVICES — Comprehensive cases for useDeviceConfig + useDeviceControl
// ============================================================
// Covers: all config deviceTypes, toggle/no-toggle, modal/expand/trigger,
//         multi-feature, single-feature, online/offline, readOnly, dependent features,
//         Grid vs FullWidth layout (determined by ListDevice idx % 3 === 0)

export const MOCK_DEVICES: TDevice[] = [
  // ─────────────────────────────────────────────
  // 1. LIGHT — hasToggle:true, ON, online, multi-feature → showExpandIcon
  //    idx=0 → FullWidth layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-light-living',
    name: 'Đèn phòng khách',
    identifier: 'mock-001',
    token: 'token-light-living',
    status: EDeviceStatus.ONLINE,
    type: 'light',
    modelName: 'Smart LED Bulb',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 1,
    room: { id: 'room-1', name: 'Phòng khách' },
    features: [
      { id: 'f-light-sw', code: 'switch_led', name: 'Bật/Tắt', type: 'Boolean', category: 'light', readOnly: false, currentValue: 1 },
      { id: 'f-light-br', code: 'bright_value', name: 'Độ sáng', type: 'Integer', category: 'light', readOnly: false, currentValue: 80 },
      { id: 'f-light-ct', code: 'temp_value', name: 'Nhiệt độ màu', type: 'Integer', category: 'light', readOnly: false, currentValue: 4000 },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. SWITCH — hasToggle:true, OFF, online, single feature → no expand icon
  //    idx=1 → Grid layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-switch-1',
    name: 'Công tắc cửa',
    identifier: 'mock-002',
    token: 'token-switch-1',
    status: EDeviceStatus.ONLINE,
    type: 'switch',
    modelName: 'Wall Switch',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 2,
    room: { id: 'room-1', name: 'Phòng khách' },
    features: [
      { id: 'f-sw-1', code: 'switch_1', name: 'Công tắc', type: 'Boolean', category: 'switch', readOnly: false, currentValue: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. SENSOR — hasToggle:false, online, readOnly features → no toggle, card press → modal
  //    idx=2 → Grid layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-sensor-temp',
    name: 'Cảm biến nhiệt độ',
    identifier: 'mock-003',
    token: 'token-sensor-temp',
    status: EDeviceStatus.ONLINE,
    type: 'sensor',
    modelName: 'Temp & Humidity Sensor',
    protocol: EDeviceProtocol.ZIGBEE,
    ownership: EOwnership.OWNER,
    sortOrder: 3,
    room: { id: 'room-2', name: 'Phòng ngủ' },
    features: [
      { id: 'f-temp', code: 'va_temperature', name: 'Nhiệt độ', type: 'Integer', category: 'sensor', readOnly: true, currentValue: 26 },
      { id: 'f-hum', code: 'va_humidity', name: 'Độ ẩm', type: 'Integer', category: 'sensor', readOnly: true, currentValue: 65 },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. CAMERA — hasToggle:false, online, card press → modal (70% snap)
  //    idx=3 → FullWidth layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-camera-door',
    name: 'Camera cửa trước',
    identifier: 'mock-004',
    token: 'token-camera-door',
    status: EDeviceStatus.ONLINE,
    type: 'camera',
    modelName: 'Indoor Camera 2K',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 4,
    room: { id: 'room-1', name: 'Phòng khách' },
    features: [
      { id: 'f-cam-ptz', code: 'ptz_control', name: 'Xoay camera', type: 'Enum', category: 'camera', readOnly: false },
      { id: 'f-cam-motion', code: 'motion_detect', name: 'Phát hiện', type: 'Boolean', category: 'camera', readOnly: true, currentValue: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. LOCK — hasToggle:true, OFF (locked), online
  //    idx=4 → Grid layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-lock-front',
    name: 'Khoá cửa chính',
    identifier: 'mock-005',
    token: 'token-lock-front',
    status: EDeviceStatus.ONLINE,
    type: 'lock',
    modelName: 'Smart Door Lock',
    protocol: EDeviceProtocol.BLE,
    ownership: EOwnership.OWNER,
    sortOrder: 5,
    room: null,
    features: [
      { id: 'f-lock', code: 'switch_lock', name: 'Mở khoá', type: 'Boolean', category: 'lock', readOnly: false, currentValue: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. CURTAIN — hasToggle:true, ON (open), online, multi-feature → expand
  //    idx=5 → Grid layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-curtain-1',
    name: 'Rèm phòng khách',
    identifier: 'mock-006',
    token: 'token-curtain-1',
    status: EDeviceStatus.ONLINE,
    type: 'curtain',
    modelName: 'Smart Curtain Motor',
    protocol: EDeviceProtocol.ZIGBEE,
    ownership: EOwnership.OWNER,
    sortOrder: 6,
    room: { id: 'room-1', name: 'Phòng khách' },
    features: [
      { id: 'f-curtain-sw', code: 'control', name: 'Đóng/Mở', type: 'Boolean', category: 'curtain', readOnly: false, currentValue: 1 },
      { id: 'f-curtain-pos', code: 'percent_control', name: 'Vị trí', type: 'Integer', category: 'curtain', readOnly: false, currentValue: 75 },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. CLIMATE — hasToggle:true, ON, online, multi-feature (temp, mode, fan)
  //    idx=6 → FullWidth layout, snap 60%
  // ─────────────────────────────────────────────
  {
    id: 'mock-ac-1',
    name: 'Điều hoà phòng ngủ',
    identifier: 'mock-007',
    token: 'token-ac-1',
    status: EDeviceStatus.ONLINE,
    type: 'climate',
    modelName: 'IR Climate Control',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 7,
    room: { id: 'room-2', name: 'Phòng ngủ' },
    features: [
      { id: 'f-ac-sw', code: 'switch', name: 'Bật/Tắt', type: 'Boolean', category: 'climate', readOnly: false, currentValue: 1 },
      { id: 'f-ac-temp', code: 'temp_set', name: 'Nhiệt độ', type: 'Integer', category: 'climate', readOnly: false, currentValue: 24 },
      { id: 'f-ac-mode', code: 'mode', name: 'Chế độ', type: 'Enum', category: 'climate', readOnly: false, currentValue: 'cool' },
      { id: 'f-ac-fan', code: 'fan_speed', name: 'Tốc độ quạt', type: 'Enum', category: 'climate', readOnly: false, currentValue: 'auto' },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. WIFI_SWITCH_4 — specific DeviceModel.code, 4 features (unpacked in split mode)
  //    idx=7 → Grid layout, hasToggle:true
  // ─────────────────────────────────────────────
  {
    id: 'mock-wifi-sw4',
    name: 'Công tắc 4 kênh',
    identifier: 'mock-008',
    token: 'token-wifi-sw4',
    status: EDeviceStatus.ONLINE,
    type: 'WIFI_SWITCH_4',
    modelName: 'WiFi Switch 4CH',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 8,
    room: { id: 'room-1', name: 'Phòng khách' },
    features: [
      { id: 'f-ws4-1', code: 'switch_1', name: 'Kênh 1', type: 'Boolean', category: 'switch', readOnly: false, currentValue: 1 },
      { id: 'f-ws4-2', code: 'switch_2', name: 'Kênh 2', type: 'Boolean', category: 'switch', readOnly: false, currentValue: 0 },
      { id: 'f-ws4-3', code: 'switch_3', name: 'Kênh 3', type: 'Boolean', category: 'switch', readOnly: false, currentValue: 1 },
      { id: 'f-ws4-4', code: 'switch_4', name: 'Kênh 4', type: 'Boolean', category: 'switch', readOnly: false, currentValue: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. SHUTTER_DOOR — specific DeviceModel.code, hasToggle:true
  //    idx=8 → FullWidth layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-shutter-1',
    name: 'Cửa cuốn garage',
    identifier: 'mock-009',
    token: 'token-shutter-1',
    status: EDeviceStatus.ONLINE,
    type: 'SHUTTER_DOOR',
    modelName: 'Shutter Door Controller',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 9,
    room: null,
    features: [
      { id: 'f-shutter-sw', code: 'control', name: 'Mở/Đóng', type: 'Boolean', category: 'curtain', readOnly: false, currentValue: 0 },
      { id: 'f-shutter-pos', code: 'percent_state', name: 'Vị trí', type: 'Integer', category: 'curtain', readOnly: true, currentValue: 0 },
    ],
  },

  // ─────────────────────────────────────────────
  // 10. ALEXA — hasToggle:false, card press → modal
  //     idx=9 → FullWidth layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-speaker',
    name: 'Loa thông minh',
    identifier: 'mock-010',
    token: 'token-speaker',
    status: EDeviceStatus.ONLINE,
    type: 'alexa',
    modelName: 'Smart Speaker',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 10,
    room: { id: 'room-1', name: 'Phòng khách' },
    features: [
      { id: 'f-speaker-play', code: 'play_control', name: 'Phát nhạc', type: 'Enum', category: 'alexa', readOnly: false },
    ],
  },

  // ─────────────────────────────────────────────
  // 11. LIGHT — OFFLINE + ON → tests offline styling with isOn=true
  //     idx=10 → Grid layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-light-offline',
    name: 'Đèn phòng ngủ (offline)',
    identifier: 'mock-011',
    token: 'token-light-offline',
    status: EDeviceStatus.OFFLINE,
    type: 'light',
    modelName: 'Smart Light',
    protocol: EDeviceProtocol.BLE,
    ownership: EOwnership.OWNER,
    sortOrder: 11,
    room: { id: 'room-2', name: 'Phòng ngủ' },
    features: [
      { id: 'f-light-off', code: 'switch_led', name: 'Bật/Tắt', type: 'Boolean', category: 'light', readOnly: false, currentValue: 1 },
    ],
  },

  // ─────────────────────────────────────────────
  // 12. SENSOR — OFFLINE + readOnly → no toggle, offline badge
  //     idx=11 → Grid layout
  // ─────────────────────────────────────────────
  {
    id: 'mock-sensor-offline',
    name: 'Cảm biến cửa (offline)',
    identifier: 'mock-012',
    token: 'token-sensor-offline',
    status: EDeviceStatus.OFFLINE,
    type: 'sensor',
    modelName: 'Door Sensor',
    protocol: EDeviceProtocol.ZIGBEE,
    ownership: EOwnership.SHARED,
    sortOrder: 12,
    room: null,
    features: [
      { id: 'f-door', code: 'doorcontact_state', name: 'Trạng thái cửa', type: 'Boolean', category: 'sensor', readOnly: true, currentValue: 0 },
    ],
  },
];
