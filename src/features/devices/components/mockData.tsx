import type { TDevice } from '@/lib/api/devices/device.service';
import { EDeviceProtocol, EDeviceStatus, EOwnership } from '@/lib/api/devices/device.service';

// Mock data sử dụng UI-level device shape

// ─── Mock Devices (Temporary — for App Store submission) ───
export const MOCK_DEVICES: TDevice[] = [
  {
    id: 'mock-light-living',
    name: 'Đèn phòng khách',
    identifier: 'mock-001',
    token: '',
    status: EDeviceStatus.ONLINE,
    type: 'light',
    modelName: 'Smart Light',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 1,
    room: null,
    features: [
      { id: 'f-light-1', code: 'switch_led', name: 'Bật/Tắt', type: 'Boolean', category: 'light', readOnly: false, currentValue: true },
    ],
  },
  {
    id: 'mock-camera-door',
    name: 'Camera cửa trước',
    identifier: 'mock-002',
    token: '',
    status: EDeviceStatus.ONLINE,
    type: 'camera',
    modelName: 'Smart Camera',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 2,
    room: null,
    features: [
      { id: 'f-cam-1', code: 'ptz_control', name: 'Xoay camera', type: 'Enum', category: 'camera', readOnly: false },
    ],
  },
  {
    id: 'mock-light-bedroom',
    name: 'Đèn phòng ngủ',
    identifier: 'mock-003',
    token: '',
    status: EDeviceStatus.OFFLINE,
    type: 'light',
    modelName: 'Smart Light',
    protocol: EDeviceProtocol.BLE,
    ownership: EOwnership.OWNER,
    sortOrder: 3,
    room: null,
    features: [
      { id: 'f-light-2', code: 'switch_led', name: 'Bật/Tắt', type: 'Boolean', category: 'light', readOnly: false, currentValue: false },
      { id: 'f-light-3', code: 'bright_value', name: 'Độ sáng', type: 'Integer', category: 'light', readOnly: false, currentValue: 80 },
    ],
  },
  {
    id: 'mock-speaker',
    name: 'Loa thông minh',
    identifier: 'mock-004',
    token: '',
    status: EDeviceStatus.ONLINE,
    type: 'alexa',
    modelName: 'Smart Speaker',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 4,
    room: null,
    features: [
      { id: 'f-speaker-1', code: 'play_control', name: 'Phát nhạc', type: 'Enum', category: 'alexa', readOnly: false },
    ],
  },
  {
    id: 'mock-camera-garden',
    name: 'Camera sân vườn',
    identifier: 'mock-005',
    token: '',
    status: EDeviceStatus.ONLINE,
    type: 'camera',
    modelName: 'Outdoor Camera',
    protocol: EDeviceProtocol.WIFI,
    ownership: EOwnership.OWNER,
    sortOrder: 5,
    room: null,
    features: [
      { id: 'f-cam-2', code: 'motion_detect', name: 'Phát hiện chuyển động', type: 'Boolean', category: 'camera', readOnly: true, currentValue: true },
    ],
  },
];
