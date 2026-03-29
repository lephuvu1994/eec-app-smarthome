import { client } from '../common';

// ============================================================
// ENUMS
// ============================================================
export enum EDeviceProtocol {
  WIFI = 'WIFI',
  ZIGBEE = 'ZIGBEE',
  BLE = 'BLE',
  MATTER = 'MATTER',
  MQTT = 'MQTT',
  GSM_4G = 'GSM_4G',
}

export enum EDeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum EOwnership {
  OWNER = 'OWNER',
  SHARED = 'SHARED',
}

export enum EEntityDomain {
  LIGHT = 'light',
  SWITCH = 'switch_',
  SENSOR = 'sensor',
  CAMERA = 'camera',
  LOCK = 'lock',
  CURTAIN = 'curtain',
  CLIMATE = 'climate',
  BUTTON = 'button',
}

// ============================================================
// TYPES
// ============================================================
export type TEntityAttribute = {
  id: string;
  key: string;
  name: string;
  valueType: string;
  numValue?: number | null;
  strValue?: string | null;
  currentValue?: any;
  min?: number | null;
  max?: number | null;
  unit?: string | null;
  readOnly: boolean;
  enumValues?: string[];
};

export type TDeviceEntity = {
  id: string;
  code: string;
  name: string;
  domain: EEntityDomain | string; // EntityDomain enum or custom string
  state?: number | null;
  stateText?: string | null;
  currentState?: any;
  commandKey?: string | null;
  readOnly: boolean;
  sortOrder: number;
  attributes: TEntityAttribute[];
};

export type TDevice = {
  id: string;
  name: string;
  identifier: string;
  token: string;
  status: EDeviceStatus;
  type: string; // DeviceModel.code (e.g. "SHUTTER_DOOR")
  modelName: string; // DeviceModel.name (e.g. "Cửa cuốn")
  protocol: EDeviceProtocol;
  ownership: EOwnership;
  sortOrder: number;
  room?: { id: string; name: string } | null;
  entities: TDeviceEntity[];
  modelConfig?: any;
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
  entities: { code: string; name: string; domain: string }[];
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

export type TMqttCredentials = {
  url: string;
  username: string;
  password: string;
  clientId: string;
};

// ============================================================
// API SERVICE
// ============================================================
export enum EDeviceTimelineType {
  State = 'state',
  Connection = 'connection',
}

export enum EDeviceTimelineEvent {
  Online = 'online',
  Offline = 'offline',
  On = 'on',
  Off = 'off',
  Pause = 'pause',
}

export enum EDeviceTimelineSource {
  App = 'app',
  Physical = 'physical',
  Voice = 'voice',
  Automation = 'automation',
}

export type TDeviceTimelineItem = {
  id: string;
  type: EDeviceTimelineType | string;
  event: EDeviceTimelineEvent | string;
  source: EDeviceTimelineSource | string | null;
  entityCode: string | null;
  entityName: string | null;
  createdAt: string; // ISO Date String
};

export type TDeviceTimelineResponse = {
  statusCode: number;
  message: string;
  data: TDeviceTimelineItem[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
};

export const deviceService = {
  registerDevice: async (variables: TRegisterDeviceVariables): Promise<TRegisterDeviceResponse> => {
    const { data } = await client.post<TRegisterDeviceResponse>(
      '/devices/register',
      variables,
    );
    return data;
  },

  getDevices: async (params?: { homeId?: string; roomId?: string; page?: number; limit?: number }): Promise<TDeviceListResponse> => {
    const { data } = await client.get('/devices', { params });
    return data;
  },

  getDeviceDetail: async (id: string): Promise<TDevice> => {
    const { data } = await client.get(`/devices/${id}`);
    return data.data?.device || data.data || data;
  },

  getDeviceTimeline: async (
    deviceId: string,
    params?: { page?: number; limit?: number; entityCode?: string; from?: string; to?: string },
  ): Promise<TDeviceTimelineResponse> => {
    const { data } = await client.get(`/devices/${deviceId}/timeline`, { params });
    return data;
  },

  getSiriSync: async (): Promise<TSiriSyncData> => {
    const { data } = await client.get('/devices/siri-sync');
    return data.data || data;
  },

  getMqttCredentials: async (): Promise<TMqttCredentials> => {
    const { data } = await client.get('/devices/mqtt-credentials');
    return data.data || data;
  },

  setEntityValue: async (deviceToken: string, entityCode: string, value: any): Promise<void> => {
    await client.post(`/devices/${deviceToken}/entities/${entityCode}/setValue`, { value });
  },
};
