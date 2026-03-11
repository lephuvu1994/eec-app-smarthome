import { client } from '../common';

export enum DeviceProtocol {
  WIFI = 'WIFI',
  ZIGBEE = 'ZIGBEE',
  BLE = 'BLE',
  MATTER = 'MATTER',
  MQTT = 'MQTT',
  GSM_4G = 'GSM_4G',
}

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
    // ...other device info
  };
};

export const deviceService = {
  registerDevice: async (variables: RegisterDeviceVariables): Promise<RegisterDeviceResponse> => {
    const { data } = await client.post<RegisterDeviceResponse>(
      '/devices/register',
      variables
    );
    return data;
  },
};
