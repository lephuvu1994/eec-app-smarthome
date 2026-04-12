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

export enum ESharePermission {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  OWNER = 'OWNER',
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
  commandKey?: string | null;
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
  rssi?: number | null;
  linkquality?: number | null;
  type: string; // DeviceModel.code (e.g. "SHUTTER_DOOR")
  modelName: string; // DeviceModel.name (e.g. "Cửa cuốn")
  protocol: EDeviceProtocol;
  ownership: EOwnership;
  sortOrder: number;
  room?: { id: string; name: string } | null;
  entities: TDeviceEntity[];
  modelConfig?: any;
  customConfig?: any;
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

export type TDeviceShare = {
  id: string;
  deviceId: string;
  userId: string;
  permission: ESharePermission;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
  };
};

export type TDeviceShareTokenPreview = {
  deviceName: string;
  ownerName: string;
  permission: ESharePermission;
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
  RF = 'rf',
  Voice = 'voice',
  Automation = 'automation',
  System = 'system',
  Ble = 'ble',
}

export type TDeviceTimelineItem = {
  id: string;
  type: EDeviceTimelineType | string;
  event: EDeviceTimelineEvent | string;
  source: EDeviceTimelineSource | string | null;
  deviceId?: string;
  deviceName?: string;
  roomName?: string | null;
  entityCode: string | null;
  entityName: string | null;
  actionBy?: {
    userName: string | null;
    userAvatar: string | null;
    userEmail?: string | null;
    userPhone?: string | null;
  } | null;
  createdAt: string; // ISO Date String
};

export enum ETypeViewDevice {
  FullWidth = 'full', // 1 column
  HalfWidth = 'half', // 2 columns
  OneThirdWidth = 'third', // 3 columns
}
