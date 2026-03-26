// Re-export from API service for backward compatibility
export { EDeviceStatus, EOwnership } from '@/lib/api/devices/device.service';

export enum ETypeViewDevice {
  FullWidth = 'full', // 1 column
  HalfWidth = 'half', // 2 columns
  OneThirdWidth = 'third', // 3 columns
}
