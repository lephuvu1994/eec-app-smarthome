export type TDeviceListResponse = {
  statusCode: number;
  data: TDevice[];
  meta: { total: number; page: number; lastPage: number };
};

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
