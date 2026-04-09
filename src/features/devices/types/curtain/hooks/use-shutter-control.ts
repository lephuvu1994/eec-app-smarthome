import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import type { TxKeyPath } from '@/lib/i18n';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { cancelAnimation, Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { showErrorMessage } from '@/components/ui';
import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService, EDeviceStatus } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';

import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';

// ─── Chip firmware schema (app_door_controller_core.c) ───────────────────────
// Commands (App → Chip): OPEN, CLOSE, STOP
// States   (Chip → App): OPENING, CLOSING, OPENED, CLOSED, STOPPED
// Position (Chip → App): 0-100 (gửi kèm state, app tự animate)
// ─────────────────────────────────────────────────────────────────────────────

/** Movement state reported by chip */
export enum EDoorState {
  Opened = 'OPENED',
  Closed = 'CLOSED',
  Stopped = 'STOPPED',
  Opening = 'OPENING',
  Closing = 'CLOSING',
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
  const doorState = (primaryEntity?.currentState as EDoorState) || EDoorState.Stopped;
  const doorStateRef = useRef<EDoorState>(doorState);
  useEffect(() => {
    doorStateRef.current = doorState;
  }, [doorState]);

  /** Initial Position Resolution */
  const initialPositionAttr = primaryEntity?.attributes?.find(a => a.key === 'position');
  let initialPos = 0;
  const posRaw = initialPositionAttr?.currentValue;
  if (posRaw !== undefined && posRaw !== null && posRaw !== '') {
    const parsed = Number(posRaw);
    if (!Number.isNaN(parsed)) {
      initialPos = parsed;
    }
  }
  else if (doorState === EDoorState.Opened) {
    initialPos = 100;
  }
  else if (doorState === EDoorState.Closed) {
    initialPos = 0;
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

  /** Motor Direction */
  const motorDirAttr = primaryEntity?.attributes?.find(a => a.key === 'motor_direction') || configEntity?.attributes?.find(a => a.key === 'motor_direction');
  const isMotorReversed = ((motorDirAttr?.currentValue as string) || (motorDirAttr?.strValue as string) || '') === 'REVERSE';

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

  // ─── Force-sync SharedValue when app resumes from background ──────────────
  // Reanimated SharedValue on UI thread can lose/corrupt its value when iOS
  // suspends the app. Since doorState may not change (still CLOSED), we must
  // explicitly re-set position.value on every inactive→active transition.
  useEffect(() => {
    const syncPosition = () => {
      const state = doorStateRef.current;
      cancelAnimation(position);
      if (state === EDoorState.Opened) {
        position.value = 100;
      }
      else if (state === EDoorState.Closed) {
        position.value = 0;
      }
      else if (state === EDoorState.Stopped) {
        const posAttr = primaryEntity?.attributes?.find(a => a.key === 'position');
        const storedPos = Number(posAttr?.currentValue);
        if (!Number.isNaN(storedPos) && storedPos >= 0 && storedPos <= 100) {
          position.value = storedPos;
        }
      }
      else if (state === EDoorState.Opening) {
        const durationMs = travelMsRef.current > 0 ? travelMsRef.current : 20000;
        const remain = ((100 - position.value) / 100) * durationMs;
        position.value = withTiming(100, { duration: Math.max(remain, 100), easing: Easing.linear });
      }
      else if (state === EDoorState.Closing) {
        const durationMs = travelMsRef.current > 0 ? travelMsRef.current : 20000;
        const remain = (position.value / 100) * durationMs;
        position.value = withTiming(0, { duration: Math.max(remain, 100), easing: Easing.linear });
      }
    };

    // Sync on doorState change (e.g. from API refetch or MQTT)
    syncPosition();

    let resumeTimeout: ReturnType<typeof setTimeout>;
    // Sync on app resume (doorState unchanged but SharedValue corrupted)
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        // Small delay to ensure UI thread is fully resumed
        resumeTimeout = setTimeout(syncPosition, 100);
      }
    });

    return () => {
      sub.remove();
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
    };
  }, [doorState, position, primaryEntity?.attributes]);

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
          useDeviceStore.getState().updateDeviceStatus(device.id, data.online ? EDeviceStatus.ONLINE : EDeviceStatus.OFFLINE);
        }

        const matchesEntity = data.entityCode === primaryEntity?.code || (!data.entityCode && primaryEntity);
        if (!matchesEntity && data.state === undefined) {
          return;
        }

        // Primary entity state — parse with backward compat map
        const val = data.state ?? data.value;
        const stateMap: Record<string, EDoorState> = {
          OPEN: EDoorState.Opened,
          OPENED: EDoorState.Opened,
          CLOSE: EDoorState.Closed,
          CLOSED: EDoorState.Closed,
          STOP: EDoorState.Stopped,
          STOPPED: EDoorState.Stopped,
          OPENING: EDoorState.Opening,
          CLOSING: EDoorState.Closing,
        };
        const newState = (typeof val === 'string' ? stateMap[val] : undefined) ?? doorStateRef.current;

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

        if (incomingPosition !== null && device?.id && primaryEntity?.code) {
          updateDeviceEntity(device.id, primaryEntity.code, { attributes: [{ key: 'position', value: incomingPosition }] });
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

        const incomingDir = data.dir || data.config?.dir;
        if (incomingDir !== undefined && device?.id) {
          updateDeviceEntity(device.id, 'config', { attributes: [{ key: 'motor_direction', value: incomingDir }] });
          updateDeviceEntity(device.id, primaryEntity?.code || 'main', { attributes: [{ key: 'motor_direction', value: incomingDir }] });
        }
        if (data.config && typeof data.config === 'object' && device?.id) {
          updateDeviceEntity(device.id, 'config', { state: data.config });
        }

        // --- Position Animation Logic ---
        // Vị trí động cơ tính toán liên tục, animate theo EDoorState
        if (isStateChanged) {
          const durationMs = travelMsRef.current > 0 ? travelMsRef.current : 20000;

          if (newState === EDoorState.Opening) {
            cancelAnimation(position);
            const remain = ((100 - position.value) / 100) * durationMs;
            position.value = withTiming(100, { duration: Math.max(remain, 100), easing: Easing.linear });
          }
          else if (newState === EDoorState.Closing) {
            cancelAnimation(position);
            const remain = (position.value / 100) * durationMs;
            position.value = withTiming(0, { duration: Math.max(remain, 100), easing: Easing.linear });
          }
          else if (newState === EDoorState.Stopped || newState === EDoorState.Opened || newState === EDoorState.Closed) {
            cancelAnimation(position);
            if (incomingPosition !== null) {
              position.value = withTiming(incomingPosition, { duration: 300 });
            }
            else if (newState === EDoorState.Opened) {
              position.value = withTiming(100, { duration: 300 });
            }
            else if (newState === EDoorState.Closed) {
              position.value = withTiming(0, { duration: 300 });
            }
          }
        }
        else if (incomingPosition !== null && newState !== EDoorState.Opening && newState !== EDoorState.Closing) {
          // Nếu rèm không chạy mà chip tự đổi position, update ngay
          position.value = withTiming(incomingPosition, { duration: 300 });
        }
      },
      [primaryEntity, position, device?.id, updateDeviceEntity],
    ),
  );

  // ─── Command sender ───────────────────────────────────────────────────────
  const sendCommand = useCallback(async (entityCode: string, value: EShutterCmd | number | string | Record<string, any>) => {
    if (!device)
      return;

    if (!isOnline) {
      showErrorMessage((translate('deviceDetail.shutter.offlineWarning' as TxKeyPath)));
      return;
    }

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
  }, [device, allowHaptics, isOnline]);

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
    // Motor Direction control
    handleMotorDirection: useCallback((isReversed: boolean) => sendCommand(mainCode, isReversed ? 'DIR_REV' : 'DIR_FWD'), [sendCommand, mainCode]),
    handleMotorDir: useCallback((dir: 'DIR_FWD' | 'DIR_REV') => sendCommand(mainCode, dir), [sendCommand, mainCode]),
    // Child lock — entity `child_lock` (lock domain), value: 0 | 1
    handleChildLock: useCallback((lock: boolean) => sendCommand('child_lock', lock ? 1 : 0), [sendCommand]),
    // BLE mode — entity `ble_mode` (switch domain), value: "on" | "off"
    handleBleMode: useCallback((on: boolean) => sendCommand('ble_mode', on ? 'on' : 'off'), [sendCommand]),
    // RF learning (Hardware-driven Flow)
    handleRfLearnStart: useCallback(() => sendCommand('learn', 'start'), [sendCommand]),
    handleRfLearnCancel: useCallback(() => sendCommand('learn', 'cancel'), [sendCommand]),
    handleRfLearnSave: useCallback(() => sendCommand('learn', 'save'), [sendCommand]),
    handleRfLearnClear: useCallback(() => sendCommand('learn', 'clear'), [sendCommand]),
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
    isMotorReversed,
    isOnline,
    childLockEntity,
  };
}
