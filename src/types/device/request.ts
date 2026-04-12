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
