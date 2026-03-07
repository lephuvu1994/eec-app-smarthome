export enum EDeviceConnectStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export enum ETypeViewDevice {
  FullWidth,
  Grid
}

export enum EDeviceStatus {
  ON = 'ON',
  OFF = 'OFF',
}

export type TDevice = {
  id: string;
  name: string;
  type: string;
  status: EDeviceConnectStatus;
  image: string;
}