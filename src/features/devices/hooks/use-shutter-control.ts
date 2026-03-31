import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelAnimation, Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { showErrorMessage } from '@/components/ui';
import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService, EDeviceStatus } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';

import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';

// ─── Chip firmware schema (app_door_controller_core.c) ───────────────────────
// Status published: { "online":true, "state":"OPEN|CLOSE|STOP",
//                    "position":0-100, "child_lock":"LOCKED|UNLOCKED",
//                    "travel":20000 }
// Note: firmware maps OPENING→OPEN, CLOSING→CLOSE in status messages.
// ─────────────────────────────────────────────────────────────────────────────

/** Movement state reported by chip */
export enum EDoorState {
  Open = 'OPEN',
  Close = 'CLOSE',
  Stop = 'STOP',
}

/** Commands accepted by chip via `state` / `cmd` field (curtain domain) */
export enum EShutterCmd {
  Open = 'OPEN',
  Close = 'CLOSE',
  Stop = 'STOP',
}

export function useShutterControl(
  device: TDevice | undefined,
  primaryEntity: TDeviceEntity | undefined,
) {
  const allowHaptics = useConfigManager(s => s.allowHaptics);

  /** Movement state from chip (Derived from global store) */
  const doorState = (primaryEntity?.currentState as EDoorState) || EDoorState.Stop;
  const doorStateRef = useRef<EDoorState>(doorState);
  useEffect(() => {
    doorStateRef.current = doorState;
  }, [doorState]);

  /** Initial Position Resolution */
  const initialPositionAttr = primaryEntity?.attributes?.find(a => a.key === 'position');
  let initialPos = 0;
  if (typeof initialPositionAttr?.currentValue === 'number') {
    initialPos = initialPositionAttr.currentValue;
  }
  else if (doorState === EDoorState.Open) {
    initialPos = 100;
  }
  else if (doorState === EDoorState.Close) {
    initialPos = 0;
  }
  else {
    initialPos = 0; // Default or STOP
  }

  /**
   * Animated position 0–100 %.
   * Use `useAnimatedProps` or `useAnimatedStyle` in the UI to read this.
   */
  const position = useSharedValue<number>(initialPos);

  const childLockEntity = device?.entities.find(e => e.code === 'child_lock');
  const configEntity = device?.entities.find(e => e.code === 'config');
  const learnEntity = device?.entities.find(e => e.code === 'learn');

  /** Child lock state */
  const childLockAttr = primaryEntity?.attributes?.find(a => a.key === 'child_lock');
  const childLock = childLockEntity?.currentState === 1
    || childLockEntity?.currentState === '1'
    || childLockEntity?.currentState === 'LOCKED'
    || childLockAttr?.currentValue === 'LOCKED'
    || childLockAttr?.strValue === 'LOCKED'
    || false;

  /** Configured travel time in ms */
  const travelAttr = primaryEntity?.attributes?.find(a => a.key === 'travel') || configEntity?.attributes?.find(a => a.key === 'travel');
  const travelMs = (travelAttr?.currentValue as number) || (travelAttr?.numValue as number) || 20000;
  const travelMsRef = useRef<number>(travelMs);
  useEffect(() => {
    travelMsRef.current = travelMs;
  }, [travelMs]);

  /** RF Learning tracking string */
  const rfLearnAttr = primaryEntity?.attributes?.find(a => a.key === 'rf_learn_status') || learnEntity?.attributes?.find(a => a.key === 'rf_learn_status');
  const rfLearnStatus = (rfLearnAttr?.currentValue as string) || (rfLearnAttr?.strValue as string) || '';

  /** Motor config */
  let motorConfig: { clicks?: number; start_time?: string; end_time?: string } | undefined;
  if (configEntity) {
    let rawConfig: any = null;
    if (typeof configEntity.currentState === 'object' && configEntity.currentState) {
      rawConfig = configEntity.currentState;
    }
    else if (typeof configEntity.stateText === 'string' && configEntity.stateText) {
      try {
        rawConfig = JSON.parse(configEntity.stateText);
      }
      catch {
        /* ignore */
      }
    }

    if (rawConfig) {
      motorConfig = {
        clicks: rawConfig.req_open_clicks ?? rawConfig.clicks,
        start_time: rawConfig.start_time,
        end_time: rawConfig.end_time,
      };
    }
  }

  /** True while an API call is in flight (Keep as localized visual UI state) */
  const [isControlling, setIsControlling] = useState(false);

  /** Device online/offline real-time status - derived from global store */
  const isOnline = device?.status === 'online';

  const updateDeviceEntity = useDeviceStore(s => s.updateDeviceEntity);

  // ─── Sync state from MQTT shadow / real-time event ───────────────────────
  useDeviceEvent(
    device?.id || '',
    useCallback(
      (data: {
        entityCode?: string;
        state?: string | number;
        value?: string | number;
        attributes?: Array<{ key: string; value: string | number }>;
        [key: string]: any;
      }) => {
        // Online status (from flat LWT or heartbeat)
        if (data.online !== undefined && device?.id) {
          // If we receive a retained "offline" message (from a previous LWT), ignore it!
          // We rely on the REST API for the initial status. Real-time LWT events
          // fired while we are actively connected will NOT have the retain flag!
          if (data.online === false && data.isRetained) {
            console.log(`[IGNORE STALE LWT] Ignoring retained offline msg for ${device.id}`);
          }
          else {
            useDeviceStore.getState().updateDeviceStatus(device.id, data.online ? EDeviceStatus.ONLINE : EDeviceStatus.OFFLINE);
          }
        }

        const matchesEntity = data.entityCode === primaryEntity?.code || (!data.entityCode && primaryEntity);
        if (!matchesEntity && data.state === undefined) {
          return;
        }

        // Primary entity state (commandKey = 'state')
        const val = data.state ?? data.value;
        let newState = doorStateRef.current;
        if (val === EDoorState.Open) {
          newState = EDoorState.Open;
        }
        else if (val === EDoorState.Close) {
          newState = EDoorState.Close;
        }
        else if (val === EDoorState.Stop) {
          newState = EDoorState.Stop;
        }

        const isStateChanged = newState !== doorStateRef.current;

        // Cập nhật State React & Ref đồng bộ
        if (isStateChanged && device?.id && primaryEntity?.code) {
          doorStateRef.current = newState;
          updateDeviceEntity(device.id, primaryEntity.code, { state: newState });
        }

        // Entity attributes: position, child_lock, travel
        let incomingPosition: number | null = null;

        if (data.attributes) {
          for (const attr of data.attributes) {
            if (attr.key === 'position' && typeof attr.value === 'number') {
              incomingPosition = attr.value;
            }
          }
        }

        // --- Flat attributes from raw /status telemetry (bypassing backend DTO) ---
        if (typeof data.position === 'number') {
          incomingPosition = data.position;
        }

        // Push flat config/child_lock/travel states natively into the Global Store
        // The UI will instantly re-render via derived variables without local useState
        if (data.child_lock !== undefined && device?.id) {
          const val = data.child_lock === 'LOCKED' ? 1 : 0;
          updateDeviceEntity(device.id, 'child_lock', { state: val });
          updateDeviceEntity(device.id, primaryEntity?.code || 'main', { attributes: [{ key: 'child_lock', value: data.child_lock }] });
        }
        if (typeof data.travel === 'number' && device?.id) {
          updateDeviceEntity(device.id, 'config', { attributes: [{ key: 'travel', value: data.travel }] });
          updateDeviceEntity(device.id, primaryEntity?.code || 'main', { attributes: [{ key: 'travel', value: data.travel }] });
        }
        if (data.rf_learn_status !== undefined && device?.id) {
          updateDeviceEntity(device.id, 'learn', { attributes: [{ key: 'rf_learn_status', value: data.rf_learn_status }] });
          updateDeviceEntity(device.id, primaryEntity?.code || 'main', { attributes: [{ key: 'rf_learn_status', value: data.rf_learn_status }] });
        }
        if (data.config && typeof data.config === 'object' && device?.id) {
          updateDeviceEntity(device.id, 'config', { state: data.config });
        }

        // --- Fake Position Animation Logic ---
        // Vì C-code đang "hack" mqtt_position = 50 khi di chuyển,
        // ta bỏ qua incomingPosition nếu rèm đang chạy. Tự nội suy phần trăm theo thời gian!
        // Only trigger animations when state actually changes
        if (isStateChanged) {
          const durationMs = travelMsRef.current > 0 ? travelMsRef.current : 20000;

          if (newState === EDoorState.Open) {
            cancelAnimation(position);
            const remain = ((100 - position.value) / 100) * durationMs;
            position.value = withTiming(100, { duration: Math.max(remain, 100), easing: Easing.linear });
          }
          else if (newState === EDoorState.Close) {
            cancelAnimation(position);
            const remain = (position.value / 100) * durationMs;
            position.value = withTiming(0, { duration: Math.max(remain, 100), easing: Easing.linear });
          }
          else if (newState === EDoorState.Stop) {
            cancelAnimation(position);
            // Mới dừng: lỡ đâu chip đang gửi % thật lúc STOP? Cập nhật theo chip (nhưng bỏ qua 50% rác)
            if (incomingPosition !== null && incomingPosition !== 50) {
              position.value = withTiming(incomingPosition, { duration: 300 });
            }
          }
        }
      },
      [primaryEntity, position, device?.id, updateDeviceEntity],
    ),
  );

  // ─── Command sender ───────────────────────────────────────────────────────
  const sendCommand = useCallback(async (entityCode: string, value: EShutterCmd | number | string | Record<string, any>) => {
    if (!device)
      return;

    if (allowHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsControlling(true);
    try {
      await deviceService.setEntityValue(device.token, entityCode, value);
    }
    catch (e: any) {
      console.error('Shutter control failed:', e);
      showErrorMessage(e?.message ?? translate('base.somethingWentWrong'));
    }
    finally {
      setIsControlling(false);
    }
  }, [device, allowHaptics]);

  const mainCode = primaryEntity?.code ?? 'main';

  return {
    position,
    doorState,
    childLock,
    travelMs,
    isControlling,
    // Movement — entity `main` (curtain domain)
    handleOpen: useCallback(() => sendCommand(mainCode, EShutterCmd.Open), [sendCommand, mainCode]),
    handleClose: useCallback(() => sendCommand(mainCode, EShutterCmd.Close), [sendCommand, mainCode]),
    handleStop: useCallback(() => sendCommand(mainCode, EShutterCmd.Stop), [sendCommand, mainCode]),
    // Position control (0-100)
    handlePosition: useCallback((val: number) => sendCommand(mainCode, val), [sendCommand, mainCode]),
    // Child lock — entity `child_lock` (lock domain), value: 0 | 1
    handleChildLock: useCallback((lock: boolean) => sendCommand('child_lock', lock ? 1 : 0), [sendCommand]),
    // BLE mode — entity `ble_mode` (switch domain), value: "on" | "off"
    handleBleMode: useCallback((on: boolean) => sendCommand('ble_mode', on ? 'on' : 'off'), [sendCommand]),
    // RF learning (Hardware-driven Flow)
    handleRfLearnStart: useCallback(() => sendCommand('learn', 'start'), [sendCommand]),
    handleRfLearnCancel: useCallback(() => sendCommand('learn', 'cancel'), [sendCommand]),
    handleRfLearnSave: useCallback(() => sendCommand('learn', 'save'), [sendCommand]),
    rfLearnStatus,
    setRfLearnStatus: useCallback((status: string) => {
      // Expose to manually clear status in modal on close
      if (device?.id) {
        updateDeviceEntity(device.id, 'learn', { attributes: [{ key: 'rf_learn_status', value: status }] });
        updateDeviceEntity(device.id, primaryEntity?.code || 'main', { attributes: [{ key: 'rf_learn_status', value: status }] });
      }
    }, [device?.id, primaryEntity?.code, updateDeviceEntity]),
    // Config motor — entity `config` (config domain)
    handleConfig: useCallback((config: { clicks?: number; start_time?: string; end_time?: string }) => {
      // Map App's simplified config to Chip Firmware expected C-struct
      const chipConfig = {
        req_open_clicks: config.clicks ?? 2,
        req_close_clicks: config.clicks ?? 2,
        def_open_clicks: 1,
        def_close_clicks: 1,
        time_mode: 1, // Enable time restriction
        start_time: config.start_time ?? '00:00',
        end_time: config.end_time ?? '23:59',
      };
      return sendCommand('config', chipConfig);
    }, [sendCommand]),
    // OTA Update — entity `update` (update domain)
    handleOta: useCallback((url: string) => sendCommand('update', url), [sendCommand]),
    sendCommand,
    motorConfig,
    isOnline,
  };
}
