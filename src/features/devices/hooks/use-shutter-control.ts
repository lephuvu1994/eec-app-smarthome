import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelAnimation, Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { showErrorMessage } from '@/components/ui';
import { useDeviceEvent } from '@/hooks/use-device-event';
import { deviceService } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';

import { useConfigManager } from '@/stores/config/config';

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

  /**
   * Animated position 0–100 %.
   * Use `useAnimatedProps` or `useAnimatedStyle` in the UI to read this.
   * Example: const animatedText = useDerivedValue(() => `${Math.round(position.value)}%`);
   */
  const position = useSharedValue<number>(0);
  /** Movement state from chip (React state — drives re-render only) */
  const [doorState, setDoorState] = useState<EDoorState>(EDoorState.Stop);
  const doorStateRef = useRef<EDoorState>(EDoorState.Stop);

  /** Child lock state */
  const [childLock, setChildLock] = useState<boolean>(false);

  /** Configured travel time in ms */
  const [travelMs, setTravelMs] = useState<number>(0);
  const travelMsRef = useRef<number>(20000); // Mặc định 20s

  /** RF Learning tracking string */
  const [rfLearnStatus, setRfLearnStatus] = useState<string>('');

  /** True while an API call is in flight */
  const [isControlling, setIsControlling] = useState(false);

  /** Config Motor */
  const [motorConfig, setMotorConfig] = useState<{ clicks?: number; start_time?: string; end_time?: string } | undefined>(undefined);

  /** Device online/offline real-time status */
  const [isOnline, setIsOnline] = useState<boolean>(device?.status === 'online');

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
        if (data.online !== undefined) {
          setIsOnline(data.online === true);
        }

        const matchesEntity = data.entityCode === primaryEntity?.code || (!data.entityCode && primaryEntity);
        if (!matchesEntity && data.state === undefined)
          return;

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

        // Cập nhật State React & Ref đồng bộ
        if (newState !== doorStateRef.current) {
          doorStateRef.current = newState;
          setDoorState(newState);
        }

        // Entity attributes: position, child_lock, travel
        let incomingPosition: number | null = null;

        if (data.attributes) {
          for (const attr of data.attributes) {
            if (attr.key === 'position' && typeof attr.value === 'number') {
              incomingPosition = attr.value;
            }
            else if (attr.key === 'child_lock') {
              setChildLock(attr.value === 'LOCKED');
            }
            else if (attr.key === 'travel' && typeof attr.value === 'number') {
              setTravelMs(attr.value);
              travelMsRef.current = attr.value;
            }
            else if (attr.key === 'rf_learn_status' && typeof attr.value === 'string') {
              setRfLearnStatus(attr.value);
            }
          }
        }

        // --- Flat attributes from raw /status telemetry (bypassing backend DTO) ---
        if (typeof data.position === 'number') {
          incomingPosition = data.position;
        }
        if (data.child_lock !== undefined) {
          setChildLock(data.child_lock === 'LOCKED');
        }
        if (typeof data.travel === 'number') {
          setTravelMs(data.travel);
          travelMsRef.current = data.travel;
        }
        if (data.config && typeof data.config === 'object') {
          setMotorConfig(prev => ({
            ...prev,
            clicks: data.config.req_open_clicks ?? data.config.clicks ?? prev?.clicks,
            start_time: data.config.start_time ?? prev?.start_time,
            end_time: data.config.end_time ?? prev?.end_time,
          }));
        }

        // --- Fake Position Animation Logic ---
        // Vì C-code đang "hack" mqtt_position = 50 khi di chuyển,
        // ta bỏ qua incomingPosition nếu rèm đang chạy. Tự nội suy phần trăm theo thời gian!
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
          // Để an toàn, nếu chip báo STOP và position != 50 (nếu chip đã sửa) thì đồng bộ, còn không giữ nguyên vị trí nội suy
          if (incomingPosition !== null && incomingPosition !== 50) {
            position.value = withTiming(incomingPosition, { duration: 300 });
          }
        }
      },
      [primaryEntity, position],
    ),
  );

  // ─── Extract Initial Config from device entities ───────────────────────
  useEffect(() => {
    const configEntity = device?.entities.find(e => e.code === 'config');
    if (configEntity) {
      try {
        let rawConfig: any = null;
        if (typeof configEntity.currentState === 'object' && configEntity.currentState) {
          rawConfig = configEntity.currentState;
        }
        else if (typeof configEntity.stateText === 'string' && configEntity.stateText) {
          rawConfig = JSON.parse(configEntity.stateText);
        }

        if (rawConfig) {
          const timer = setTimeout(() => {
            setMotorConfig(prev => ({
              ...prev, // Allow real-time MQTT to have precedence if already arrived
              clicks: prev?.clicks ?? rawConfig.req_open_clicks ?? rawConfig.clicks,
              start_time: prev?.start_time ?? rawConfig.start_time,
              end_time: prev?.end_time ?? rawConfig.end_time,
            }));
          }, 0);
          return () => clearTimeout(timer);
        }
      }
      catch {
        // fail silently
      }
    }
  }, [device?.entities]);

  // ─── Command sender ───────────────────────────────────────────────────────
  const sendCommand = async (entityCode: string, value: EShutterCmd | number | string | Record<string, any>) => {
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
  };

  const mainCode = primaryEntity?.code ?? 'main';

  return {
    position,
    doorState,
    childLock,
    travelMs,
    isControlling,
    // Movement — entity `main` (curtain domain)
    handleOpen: () => sendCommand(mainCode, EShutterCmd.Open),
    handleClose: () => sendCommand(mainCode, EShutterCmd.Close),
    handleStop: () => sendCommand(mainCode, EShutterCmd.Stop),
    // Position control (0-100)
    handlePosition: (val: number) => sendCommand(mainCode, val),
    // Child lock — entity `child_lock` (lock domain), value: 0 | 1
    handleChildLock: (lock: boolean) => sendCommand('child_lock', lock ? 1 : 0),
    // BLE mode — entity `ble_mode` (switch domain), value: "on" | "off"
    handleBleMode: (on: boolean) => sendCommand('ble_mode', on ? 'on' : 'off'),
    // RF learning (Hardware-driven Flow)
    handleRfLearnStart: () => sendCommand('learn', 'start'),
    handleRfLearnCancel: () => sendCommand('learn', 'cancel'),
    handleRfLearnSave: () => sendCommand('learn', 'save'),
    rfLearnStatus,
    setRfLearnStatus, // Expose to manually clear status in modal on close
    // Config motor — entity `config` (config domain)
    handleConfig: (config: { clicks?: number; start_time?: string; end_time?: string }) => {
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
    },
    // OTA Update — entity `update` (update domain)
    handleOta: (url: string) => sendCommand('update', url),
    sendCommand,
    motorConfig,
    isOnline,
  };
}
