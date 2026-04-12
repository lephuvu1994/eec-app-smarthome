import { TDevice, TDeviceListResponse, TSiriSyncData } from '@/types/device';

import { useMutation, useQuery } from '@tanstack/react-query';

import { deviceService } from '@/lib/api/devices/device.service';
import { ESharePermission } from '@/types/device';
import { useDeviceStore } from '@/stores/device/device-store';

// ============================================================
// QUERY KEYS
// ============================================================
export const deviceKeys = {
  all: ['devices'] as const,
  list: (params?: { homeId?: string; page?: number }) =>
    ['devices', 'list', params] as const,
  detail: (id: string) => ['devices', 'detail', id] as const,
  siriSync: ['devices', 'siri-sync'] as const,
  shares: (id: string) => ['devices', 'shares', id] as const,
  tokenPreview: (token: string) => ['devices', 'shares', 'token', token] as const,
};

// ============================================================
// HOOKS
// ============================================================

/** Fetch ALL devices for a home — syncs to Zustand store */
export function useHomeDevices(homeId: string) {
  const setDevices = useDeviceStore(s => s.setDevices);

  return useQuery<TDeviceListResponse>({
    queryKey: deviceKeys.list({ homeId }),
    queryFn: async () => {
      // Execute silently in background—do NOT trigger loading state that blocks UI
      const result = await deviceService.getDevices({ homeId, limit: 50 });
      setDevices(result.data);

      // Auto-subscribe to MQTT topics for real-time status/state updates
      if (result.data.length > 0) {
        import('@/lib/mqtt/mqtt-manager').then((m) => {
          m.MqttManager.getInstance().subscribeDevices(
            result.data.map(d => ({ id: d.id, token: d.token })),
          );
        });
      }

      return result;
    },
    staleTime: 5_000, // Short stale time: on app foreground, React Query refetches to get latest device state from backend
    enabled: !!homeId,
  });
}

/** Get paginated device list (optionally filtered by homeId) */
export function useDevices(params?: { homeId?: string; roomId?: string; page?: number; limit?: number }) {
  return useQuery<TDeviceListResponse>({
    queryKey: deviceKeys.list(params),
    queryFn: async () => {
      const result = await deviceService.getDevices(params);
      if (result.data.length > 0) {
        import('@/lib/mqtt/mqtt-manager').then((m) => {
          m.MqttManager.getInstance().subscribeDevices(
            result.data.map(d => ({ id: d.id, token: d.token })),
          );
        });
      }
      return result;
    },
  });
}

/** Get single device detail */
export function useDeviceDetail(id: string) {
  return useQuery<TDevice>({
    queryKey: deviceKeys.detail(id),
    queryFn: async () => {
      const result = await deviceService.getDeviceDetail(id);
      if (result) {
        import('@/lib/mqtt/mqtt-manager').then((m) => {
          m.MqttManager.getInstance().subscribeDevices([{ id: result.id, token: result.token }]);
        });
      }
      return result;
    },
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

/** Get list of users the device is shared with */
export function useDeviceShares(deviceId: string) {
  return useQuery({
    queryKey: deviceKeys.shares(deviceId),
    queryFn: () => deviceService.getDeviceShares(deviceId),
    enabled: !!deviceId,
  });
}

/** Share device with a target user */
export function useAddDeviceShare(deviceId: string) {
  return useMutation({
    mutationFn: (variables: { targetUser: string; permission?: ESharePermission }) =>
      deviceService.addDeviceShare(deviceId, variables.targetUser, variables.permission),
  });
}

/** Remove sharing access for a target user */
export function useRemoveDeviceShare(deviceId: string) {
  return useMutation({
    mutationFn: (targetUserId: string) =>
      deviceService.removeDeviceShare(deviceId, targetUserId),
  });
}

// --- TOKEN-BASED SHARING HOOKS ---

export function useCreateDeviceShareToken(deviceId: string) {
  return useMutation({
    mutationFn: (permission: ESharePermission = ESharePermission.EDITOR) =>
      deviceService.createShareToken(deviceId, permission),
  });
}

export function useShareTokenPreview(token: string, enabled: boolean = true) {
  return useQuery({
    queryKey: deviceKeys.tokenPreview(token),
    queryFn: () => deviceService.getShareTokenPreview(token),
    enabled: !!token && enabled,
    retry: 1, // Only retry once as token might naturally be invalid
  });
}

export function useAcceptDeviceShareToken() {
  return useMutation({
    mutationFn: (token: string) => deviceService.acceptShareToken(token),
  });
}
