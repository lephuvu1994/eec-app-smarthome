import type { TDeviceConfig } from '@/features/devices/common/types';

import { client } from '../common';

// ============================================================
// API SERVICE — Device Config
// ============================================================
// BE: GET /devices/config — cached server-side, same for all users
// Response: { data: TDeviceConfig[] }

export const deviceConfigService = {
  getConfigs: async (): Promise<TDeviceConfig[]> => {
    const { data } = await client.get('/devices/config');
    return data.data;
  },
};
