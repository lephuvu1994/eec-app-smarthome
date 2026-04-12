import type { TDevice, TDeviceListResponse, TDeviceShare, TDeviceShareTokenPreview, TDeviceTimelineResponse, TMqttCredentials, TRegisterDeviceResponse, TRegisterDeviceVariables, TSiriSyncData } from '@/types/device';
import { ESharePermission } from '@/types/device';
import { client } from '../common';

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
    params?: { page?: number; limit?: number; entityCode?: string; from?: string; to?: string; type?: 'connection' | 'state' },
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

  setMultipleEntityValues: async (deviceToken: string, entityCode: string, values: any): Promise<void> => {
    // values is an object like { brightness: 50, color_temp: 4000 }
    // send as the 'value' of the entity so backend routes to iot-gateway
    await client.post(`/devices/${deviceToken}/entities/${entityCode}/setValue`, { value: values });
  },

  renameDevice: async (deviceId: string, name: string): Promise<TDevice> => {
    const { data } = await client.patch(`/devices/${deviceId}`, { name });
    return data.data || data;
  },

  renameDeviceEntity: async (deviceId: string, entityCode: string, name: string): Promise<any> => {
    const { data } = await client.patch(`/devices/${deviceId}/entities/${entityCode}`, { name });
    return data.data || data;
  },

  deleteDevice: async (deviceId: string): Promise<void> => {
    await client.delete(`/devices/${deviceId}`);
  },

  getNotifyConfig: async (deviceId: string): Promise<Record<string, boolean>> => {
    const { data } = await client.get(`/devices/${deviceId}/notify-config`);
    return data.data || data;
  },

  updateNotifyConfig: async (deviceId: string, notify: Record<string, boolean>): Promise<void> => {
    await client.patch(`/devices/${deviceId}/notify-config`, { notify });
  },

  getDeviceShares: async (deviceId: string): Promise<TDeviceShare[]> => {
    const { data } = await client.get(`/devices/${deviceId}/shares`);
    return data?.data || data;
  },

  addDeviceShare: async (deviceId: string, targetUser: string, permission: ESharePermission = ESharePermission.EDITOR): Promise<TDeviceShare> => {
    const { data } = await client.post(`/devices/${deviceId}/shares`, { targetUser, permission });
    return data?.data || data;
  },

  removeDeviceShare: async (deviceId: string, targetUserId: string): Promise<void> => {
    await client.delete(`/devices/${deviceId}/shares/${targetUserId}`);
  },

  createShareToken: async (deviceId: string, permission: ESharePermission = ESharePermission.EDITOR): Promise<{ token: string; expiresAt: string }> => {
    const { data } = await client.post(`/devices/${deviceId}/shares/tokens`, { permission });
    return data?.data || data;
  },

  getShareTokenPreview: async (token: string): Promise<TDeviceShareTokenPreview> => {
    const { data } = await client.get(`/devices/shares/tokens/${token}`);
    return data?.data || data;
  },

  acceptShareToken: async (token: string): Promise<{ success: boolean }> => {
    const { data } = await client.post(`/devices/shares/tokens/${token}/accept`);
    return data?.data || data;
  },
};
