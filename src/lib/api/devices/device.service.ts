import { client } from '../common';

export enum EDeviceProtocol {
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
export type TDeviceFeature = {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  readOnly: boolean;
  currentValue?: any;
};

export type TDevice = {
  id: string;
  name: string;
  identifier: string;
  token: string;
  status: 'online' | 'offline';
  room?: { id: string; name: string } | null;
  features: TDeviceFeature[];
};

export type TDeviceListResponse = {
  statusCode: number;
  data: TDevice[];
  meta: { total: number; page: number; lastPage: number };
};

export type TSiriSyncDevice = {
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

export type TSiriSyncScene = {
  id: string;
  name: string;
  homeId: string;
};

export type TSiriSyncData = {
  devices: TSiriSyncDevice[];
  scenes: TSiriSyncScene[];
};

export type TRegisterDeviceVariables = {
  protocol: EDeviceProtocol;
  identifier: string;
  deviceCode: string;
  partnerCode: string;
  name: string;
  homeId?: string;
  roomId?: string;
};

// Response from the server containing the device and MQTT config
export type TRegisterDeviceResponse = {
  statusCode: number;
  message: string;
  data: {
    mqtt_broker?: string;
    mqtt_token_device?: string;
    mqtt_username?: string;
    mqtt_pass?: string;
    license_days?: number;
  };
};

// ============================================================
// API SERVICE
// ============================================================
export const deviceService = {
  registerDevice: async (variables: TRegisterDeviceVariables): Promise<TRegisterDeviceResponse> => {
    const { data } = await client.post<TRegisterDeviceResponse>(
      '/devices/register',
      variables,
    );
    return data;
  },

  getDevices: async (params?: { homeId?: string; roomId?: string; page?: number; limit?: number }): Promise<TDeviceListResponse> => {
    const { data } = await client.get<TDeviceListResponse>('/devices', { params });
    return data;
  },

  getDeviceDetail: async (id: string): Promise<TDevice> => {
    const { data } = await client.get(`/devices/${id}`);
    return data.data?.device || data.data || data;
  },

  getSiriSync: async (): Promise<TSiriSyncData> => {
    const { data } = await client.get('/devices/siri-sync');
    return data.data || data;
  },
};
