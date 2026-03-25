import { useEffect } from 'react';

import { MqttManager } from '@/lib/mqtt/mqtt-manager';

/**
 * Subscribe to device-specific events from MQTT.
 * Each DeviceItem subscribes only to its own deviceId → zero cross-device re-render.
 *
 * @example
 * useDeviceEvent(device.id, (data) => {
 *   if (data.entityCode === entity.code) {
 *     setIsOn(data.state === 1);
 *   }
 * });
 */
export function useDeviceEvent(
  deviceId: string,
  handler: (data: { entityCode?: string; state?: any; value?: any }) => void,
) {
  useEffect(() => {
    const mqtt = MqttManager.getInstance();
    const key = `device:${deviceId}`;

    mqtt.subscribeDeviceState(key, handler);
    return () => {
      mqtt.unsubscribeDeviceState(key, handler);
    };
  }, [deviceId, handler]);
}
