import { client } from '../common';

export enum DeviceProtocol {
  WIFI = 'WIFI',
  ZIGBEE = 'ZIGBEE',
  BLE = 'BLE',
  MATTER = 'MATTER',
  MQTT = 'MQTT',
  GSM_4G = 'GSM_4G',
}

// ============================================================
// TYPES
// ============================================================
export type DeviceFeature = {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  readOnly: boolean;
  currentValue?: any;
};

export type Device = {
  id: string;
  name: string;
  identifier: string;
  token: string;
  status: 'online' | 'offline';
  room?: { id: string; name: string } | null;
  features: DeviceFeature[];
};

export type DeviceListResponse = {
  statusCode: number;
  data: Device[];
  meta: { total: number; page: number; lastPage: number };
};

export type SiriSyncDevice = {
  id: string;
  name: string;
  token: string;
  identifier: string;
  type: string;
  modelName: string;
  room: string | null;
  roomId: string | null;
  status: string;
  features: { code: string; name: string; type: string; category: string }[];
};

export type SiriSyncScene = {
  id: string;
  name: string;
  homeId: string;
};

export type SiriSyncData = {
  devices: SiriSyncDevice[];
  scenes: SiriSyncScene[];
};

export type RegisterDeviceVariables = {
  protocol: DeviceProtocol;
  identifier: string;
  deviceCode: string;
  partnerId: string;
  name: string;
  homeId?: string;
  roomId?: string;
};

// Response from the server containing the device and MQTT config
export type RegisterDeviceResponse = {
  statusCode: number;
  message: string;
  data: {
    mqtt_broker?: string;
    mqtt_token_device?: string;
    mqtt_username?: string;
    mqtt_pass?: string;
  };
};

// ============================================================
// API SERVICE
// ============================================================
export const deviceService = {
  registerDevice: async (variables: RegisterDeviceVariables): Promise<RegisterDeviceResponse> => {
    const { data } = await client.post<RegisterDeviceResponse>(
      '/devices/register',
      variables,
    );
    return data;
  },

  getDevices: async (params?: { homeId?: string; page?: number; limit?: number }): Promise<DeviceListResponse> => {
    const { data } = await client.get<DeviceListResponse>('/devices', { params });
    return data;
  },

  getDeviceDetail: async (id: string): Promise<Device> => {
    const { data } = await client.get(`/devices/${id}`);
    return data.data?.device || data.data || data;
  },

  getSiriSync: async (): Promise<SiriSyncData> => {
    const { data } = await client.get('/devices/siri-sync');
    return data.data || data;
  },
};

