import type { TDeviceConfig } from '@/features/devices/components/types';

import { useQuery } from '@tanstack/react-query';

import { DEFAULT_DEVICE_CONFIG } from '@/features/devices/components/types';
import { deviceConfigService } from '@/lib/api/devices/device-config.service';

/**
 * Fetch device configs from BE once per session.
 * staleTime: Infinity → no refetch during session.
 * All users receive the same config.
 */
export function useDeviceConfigs() {
  return useQuery({
    queryKey: ['device-configs'],
    queryFn: deviceConfigService.getConfigs,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Get config for a specific device type.
 * Falls back to DEFAULT_DEVICE_CONFIG if not found or still loading.
 */
export function useDeviceConfig(deviceType: string): TDeviceConfig {
  const { data: configs } = useDeviceConfigs();
  if (!Array.isArray(configs))
    return DEFAULT_DEVICE_CONFIG;
  return configs.find(c => c.deviceType === deviceType) ?? DEFAULT_DEVICE_CONFIG;
}
