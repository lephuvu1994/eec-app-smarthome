import type { TDevice, TDeviceListResponse, TSiriSyncData } from '@/lib/api/devices/device.service';

import { useQuery } from '@tanstack/react-query';

import { deviceService } from '@/lib/api/devices/device.service';

// ============================================================
// QUERY KEYS
// ============================================================
export const deviceKeys = {
  all: ['devices'] as const,
  list: (params?: { homeId?: string; page?: number }) =>
    ['devices', 'list', params] as const,
  detail: (id: string) => ['devices', 'detail', id] as const,
  siriSync: ['devices', 'siri-sync'] as const,
};

// ============================================================
// HOOKS
// ============================================================

/** Get paginated device list (optionally filtered by homeId) */
export function useDevices(params?: { homeId?: string; roomId?: string; page?: number; limit?: number }) {
  return useQuery<TDeviceListResponse>({
    queryKey: deviceKeys.list(params),
    queryFn: () => deviceService.getDevices(params),
  });
}

/** Get single device detail */
export function useDeviceDetail(id: string) {
  return useQuery<TDevice>({
    queryKey: deviceKeys.detail(id),
    queryFn: () => deviceService.getDeviceDetail(id),
    enabled: !!id,
  });
}

/** Get all devices + scenes for Siri entity sync */
export function useSiriSync() {
  return useQuery<TSiriSyncData>({
    queryKey: deviceKeys.siriSync,
    queryFn: deviceService.getSiriSync,
  });
}
