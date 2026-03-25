import type { TDevice } from '@/lib/api/devices/device.service';
import { EDeviceProtocol, EDeviceStatus, EOwnership } from '@/lib/api/devices/device.service';

// ============================================================
// MOCK DEVICES — Comprehensive cases for useDeviceConfig + useDeviceControl
// ============================================================
// Covers: all config deviceTypes, toggle/no-toggle, modal/expand/trigger,
//         multi-entity, single-entity, online/offline, readOnly, dependent attributes,
//         Grid vs FullWidth layout (determined by ListDevice idx % 3 === 0)

export const MOCK_DEVICES: TDevice[] = [
  // 1. LIGHT — hasToggle:true, ON, online, multi-entity → showExpandIcon
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
    entities: [
      { id: 'e-light-main', code: 'main', name: 'Bật/Tắt', domain: 'light', state: 1, currentState: 1, readOnly: false, sortOrder: 0, attributes: [
        { id: 'a-light-br', key: 'brightness', name: 'Độ sáng', valueType: 'INTEGER', currentValue: 80, readOnly: false, min: 0, max: 100, unit: '%' },
        { id: 'a-light-ct', key: 'color_temp', name: 'Nhiệt độ màu', valueType: 'INTEGER', currentValue: 4000, readOnly: false, min: 2700, max: 6500, unit: 'K' },
      ] },
    ],
  },

  // 2. SWITCH — single entity → no expand icon
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
    entities: [
      { id: 'e-sw-1', code: 'channel_1', name: 'Công tắc', domain: 'switch_', state: 0, currentState: 0, readOnly: false, sortOrder: 0, attributes: [] },
    ],
  },

  // 3. SENSOR — hasToggle:false, readOnly
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
    entities: [
      { id: 'e-temp', code: 'temperature', name: 'Nhiệt độ', domain: 'sensor', state: 26, currentState: 26, readOnly: true, sortOrder: 0, attributes: [] },
      { id: 'e-hum', code: 'humidity', name: 'Độ ẩm', domain: 'sensor', state: 65, currentState: 65, readOnly: true, sortOrder: 1, attributes: [] },
    ],
  },

  // 4. CAMERA — hasToggle:false, snap 70%
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
    entities: [
      { id: 'e-cam-ptz', code: 'ptz_control', name: 'Xoay camera', domain: 'camera', readOnly: false, sortOrder: 0, attributes: [] },
      { id: 'e-cam-motion', code: 'motion_detect', name: 'Phát hiện', domain: 'sensor', state: 1, currentState: 1, readOnly: true, sortOrder: 1, attributes: [] },
    ],
  },

  // 5. LOCK
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
    entities: [
      { id: 'e-lock', code: 'lock', name: 'Mở khoá', domain: 'lock', state: 0, currentState: 0, readOnly: false, sortOrder: 0, attributes: [] },
    ],
  },

  // 6. CURTAIN — multi-entity
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
    entities: [
      { id: 'e-curtain-main', code: 'main', name: 'Đóng/Mở', domain: 'curtain', state: 1, currentState: 1, readOnly: false, sortOrder: 0, attributes: [
        { id: 'a-curtain-pos', key: 'position', name: 'Vị trí', valueType: 'INTEGER', currentValue: 75, readOnly: false, min: 0, max: 100, unit: '%' },
      ] },
    ],
  },

  // 7. CLIMATE — multi-attribute entity
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
    entities: [
      { id: 'e-ac-main', code: 'main', name: 'Điều hoà', domain: 'climate', state: 1, currentState: 1, readOnly: false, sortOrder: 0, attributes: [
        { id: 'a-ac-temp', key: 'temperature', name: 'Nhiệt độ', valueType: 'INTEGER', currentValue: 24, readOnly: false, min: 16, max: 30, unit: '°C' },
        { id: 'a-ac-mode', key: 'mode', name: 'Chế độ', valueType: 'ENUM', currentValue: 'cool', readOnly: false, enumValues: ['cool', 'heat', 'auto', 'dry', 'fan'] },
        { id: 'a-ac-fan', key: 'fan_speed', name: 'Tốc độ quạt', valueType: 'ENUM', currentValue: 'auto', readOnly: false, enumValues: ['low', 'medium', 'high', 'auto'] },
      ] },
    ],
  },

  // 8. WIFI_SWITCH_4 — 4 entities (unpacked in split mode)
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
    entities: [
      { id: 'e-ws4-1', code: 'channel_1', name: 'Kênh 1', domain: 'switch_', state: 1, currentState: 1, readOnly: false, sortOrder: 0, attributes: [] },
      { id: 'e-ws4-2', code: 'channel_2', name: 'Kênh 2', domain: 'switch_', state: 0, currentState: 0, readOnly: false, sortOrder: 1, attributes: [] },
      { id: 'e-ws4-3', code: 'channel_3', name: 'Kênh 3', domain: 'switch_', state: 1, currentState: 1, readOnly: false, sortOrder: 2, attributes: [] },
      { id: 'e-ws4-4', code: 'channel_4', name: 'Kênh 4', domain: 'switch_', state: 0, currentState: 0, readOnly: false, sortOrder: 3, attributes: [] },
    ],
  },

  // 9. SHUTTER_DOOR
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
    entities: [
      { id: 'e-shutter-main', code: 'main', name: 'Mở/Đóng', domain: 'curtain', state: 0, currentState: 0, readOnly: false, sortOrder: 0, attributes: [
        { id: 'a-shutter-pos', key: 'position', name: 'Vị trí', valueType: 'INTEGER', currentValue: 0, readOnly: true, min: 0, max: 100, unit: '%' },
      ] },
    ],
  },

  // 10. ALEXA — hasToggle:false
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
    entities: [
      { id: 'e-speaker-play', code: 'play_control', name: 'Phát nhạc', domain: 'media_player', readOnly: false, sortOrder: 0, attributes: [] },
    ],
  },

  // 11. LIGHT — OFFLINE + ON → tests offline styling
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
    entities: [
      { id: 'e-light-off', code: 'main', name: 'Bật/Tắt', domain: 'light', state: 1, currentState: 1, readOnly: false, sortOrder: 0, attributes: [] },
    ],
  },

  // 12. SENSOR — OFFLINE + readOnly
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
    entities: [
      { id: 'e-door', code: 'contact', name: 'Trạng thái cửa', domain: 'sensor', state: 0, currentState: 0, readOnly: true, sortOrder: 0, attributes: [] },
    ],
  },
];
