export enum EAddDeviceStep {
  SEARCH = 0,
  RESULTS = 1,
  SETUP = 2,
  ROOM_ASSIGN = 3,
}

export type DeviceResult = {
  id: string;
  name: string;
  status: 'connecting' | 'connected' | 'failed';
  imageUrl: string;
  angle: number;
  radius: number;
};
