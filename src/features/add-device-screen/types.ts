export enum EAddDeviceStep {
  SCANNING = 0,
  LED_CONFIRM = 1,
  CONNECTING = 2,
  SETUP = 3,
  CONFIGURING = 4,
  COMPLETE = 5,
}

export enum EPairingMode {
  BLE = 'BLE',
  AP = 'AP',
}

export type TDeviceResult = {
  id: string;
  name: string;
  status: 'connecting' | 'connected' | 'failed';
  imageUrl: string;
  angle: number;
  radius: number;
};
