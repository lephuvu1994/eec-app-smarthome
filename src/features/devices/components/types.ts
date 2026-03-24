import type { ImageSource } from 'expo-image';
import type { StyleProp, ViewStyle } from 'react-native';

import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import type { ETypeViewDevice } from '@/types/device';

// ============================================================
// Device Config (from API)
// ============================================================
export type TDeviceConfig = {
  deviceType: string;
  hasToggle: boolean;
  accentColor: string;
  modalSnapPoints: string[];
  icon?: string;
};

export const DEFAULT_DEVICE_CONFIG: TDeviceConfig = {
  deviceType: 'default',
  hasToggle: true,
  accentColor: '#A3EC3E',
  modalSnapPoints: ['50%'],
};

// ============================================================
// Device Card Props (shared between Grid & FullWidth layouts)
// ============================================================
export type TDeviceCardProps = {
  device: TDevice;
  displayName: string;
  deviceImage: ImageSource;
  isOnline: boolean;
  isOn: boolean;
  isSingleEntity: boolean;
  statusLabel: string;
  entityCount: number;
  showExpandIcon: boolean;
  config: TDeviceConfig;
  // Animated styles
  animatedGradientStyle: StyleProp<ViewStyle>;
  powerButtonStyle: StyleProp<ViewStyle>;
  // Handlers
  onToggle: () => void;
  onPressCard: () => void;
  onPressExpand: () => void;
};

// ============================================================
// Device Item Entry Props
// ============================================================
export type TDeviceItemProps = {
  device: TDevice;
  typeViewDevice: ETypeViewDevice;
  activeEntity?: TDeviceEntity;
};
