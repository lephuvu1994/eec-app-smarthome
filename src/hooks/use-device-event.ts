import { useEffect } from 'react';

import SocketManager from '@/lib/socket/socket-manager';

/**
 * Subscribe to device-specific events from WebSocket.
 * Each DeviceItem subscribes only to its own deviceId → zero cross-device re-render.
 *
 * @example
 * useDeviceEvent(device.id, (data) => {
 *   if (data.featureId === feature.id) {
 *     setIsOn(data.value === 1);
 *   }
 * });
 */
export function useDeviceEvent(
  deviceId: string,
  handler: (data: { featureId?: string; value: any }) => void,
) {
  useEffect(() => {
    const sm = SocketManager.getInstance();
    const key = `device:${deviceId}`;

    sm.subscribeDeviceState(key, handler);
    return () => {
      sm.unsubscribeDeviceState(key, handler);
    };
  }, [deviceId, handler]);
}
