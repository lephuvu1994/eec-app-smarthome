import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
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

  /** True while an API call is in flight */
  const [isControlling, setIsControlling] = useState(false);

  // ─── Sync state from MQTT shadow / real-time event ───────────────────────
  useDeviceEvent(
    device?.id || '',
    useCallback(
      (data: {
        entityCode?: string;
        state?: string | number;
        value?: string | number;
        attributes?: Array<{ key: string; value: string | number }>;
      }) => {
        const matchesEntity = data.entityCode === primaryEntity?.code || (!data.entityCode && primaryEntity);
        if (!matchesEntity)
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
          }
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

  // ─── Command sender ───────────────────────────────────────────────────────
  const sendCommand = async (entityCode: string, value: EShutterCmd | number | string) => {
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
    // RF learning — entity `learn` (button domain)
    handleLearn: (action: string) => sendCommand('learn', action),
    // Config motor — entity `config` (config domain)
    handleConfig: (config: object) => sendCommand('config', typeof config === 'string' ? config : JSON.stringify(config)),
    // OTA Update — entity `update` (update domain)
    handleOta: (url: string) => sendCommand('update', url),
    sendCommand,
  };
}
