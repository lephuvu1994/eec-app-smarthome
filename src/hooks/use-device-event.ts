import { useEffect, useRef } from 'react';

import { MqttManager } from '@/lib/mqtt/mqtt-manager';

/**
 * Subscribe to device-specific events from MQTT.
 * Each DeviceItem subscribes only to its own deviceId → zero cross-device re-render.
 * Uses a ref for the handler to prevent subscription thrashing on every render.
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
  handler: (data: { entityCode?: string; state?: any; value?: any; [key: string]: any }) => void,
) {
  const handlerRef = useRef(handler);

  // Always keep the ref pointing to the latest handler
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    const mqtt = MqttManager.getInstance();
    const key = `device:${deviceId}`;

    // Static callback that delegates to the latest handler ref
    const stableCallback = (data: any) => {
      if (handlerRef.current) {
        handlerRef.current(data);
      }
    };

    mqtt.subscribeDeviceState(key, stableCallback);

    return () => {
      mqtt.unsubscribeDeviceState(key, stableCallback);
    };
  }, [deviceId]);
}
