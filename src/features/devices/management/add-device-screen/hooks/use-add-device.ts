import type { TDeviceResult } from '@/features/devices/management/add-device-screen/types';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { showErrorMessage } from '@/components/ui';
import { EAddDeviceStep, EPairingMode } from '@/features/devices/management/add-device-screen/types';
import { useRegisterDevice } from '@/hooks/use-register-device';
import { bleService, CHIP_TX_CHAR_UUID } from '@/lib/ble';
import { cryptoService } from '@/lib/crypto';
import { translate } from '@/lib/i18n';
import { useHomeStore } from '@/stores/home/home-store';
import { EDeviceProtocol } from '@/types/device';
import { BLE_ACK_TIMEOUT } from '../constants';
import { tcpClient } from '../lib/tcp-client';

export function useAddDevice() {
  const [step, setStep] = useState<EAddDeviceStep>(EAddDeviceStep.SCANNING);
  const [pairingMode, setPairingMode] = useState<EPairingMode>(EPairingMode.BLE);
  const [devices, setDevices] = useState<TDeviceResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectingAP, setIsConnectingAP] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<TDeviceResult | null>(null);
  const [configuringStatus, setConfiguringStatus] = useState('');

  const rotation = useSharedValue(0);
  const { mutateAsync: registerDevice, isPending: isRegistering } = useRegisterDevice();
  const selectedHomeId = useHomeStore.use.selectedHomeId();

  // Track connected device ID for cleanup
  const connectedDeviceIdRef = useRef<string | null>(null);
  const isScanningRef = useRef(false);
  const stepRef = useRef(step);
  const rescanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScan = useCallback(async (clearList = false) => {
    if (isScanningRef.current)
      return;
    if (clearList)
      setDevices([]);
    setIsScanning(true);
    isScanningRef.current = true;
    // Stop any stale scan from previous mount/hot reload
    await BleManager.stopScan().catch(() => {});
    await bleService.startScan(10);
  }, []);

  // ─── BLE Event Listeners ───────────────────
  useEffect(() => {
    // Keep stepRef in sync
    stepRef.current = step;

    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3500,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    const initBle = async () => {
      // Force BleManager.start() on every mount (handles hot reload)
      await BleManager.start({ showAlert: false });
      const allowed = await bleService.requestPermissions();
      if (allowed) {
        await bleService.enableBluetooth();
        startScan();
      }
      else {
        showErrorMessage(translate('base.bluetoothPermissionRequired'));
        Linking.openSettings();
      }
    };

    initBle();

    const handlerDiscover = BleManager.onDiscoverPeripheral(
      (peripheral) => {
        // Use advertising localName (actual BLE name) over cached peripheral.name
        const deviceName = peripheral.advertising?.localName || peripheral.name;
        if (!deviceName || !deviceName.includes('sensa-smart'))
          return;
        setDevices((prev) => {
          if (prev.some(d => d.id === peripheral.id))
            return prev;
          return [
            ...prev,
            {
              id: peripheral.id,
              name: deviceName,
              status: 'found',
              imageUrl: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=200&h=200&fit=crop',
              angle: Math.random() * 360,
              radius: 0.5 + Math.random() * 0.4,
            },
          ];
        });
      },
    );

    const handlerStop = BleManager.onStopScan(() => {
      setIsScanning(false);
      isScanningRef.current = false;
      // Auto-restart scan if still on scanning step
      rescanTimerRef.current = setTimeout(() => {
        if (stepRef.current === EAddDeviceStep.SCANNING) {
          startScan();
        }
      }, 1000);
    });

    const handlerValueUpdate = BleManager.onDidUpdateValueForCharacteristic(
      ({ value, peripheral, characteristic }) => {
        if (characteristic.toLowerCase() === CHIP_TX_CHAR_UUID.toLowerCase()) {
          try {
            const jsonStr = bleService.bytesToString(value);
            const handshakeData = JSON.parse(jsonStr);

            if (handshakeData.mac && handshakeData.session && handshakeData.nonce) {
              cryptoService.initSession({
                mac: handshakeData.mac,
                session: handshakeData.session,
                nonce: handshakeData.nonce,
                deviceCode: handshakeData.pid,
                partnerCode: handshakeData.cid,
              });

              setDevices(prev =>
                prev.map(d => d.id === peripheral ? { ...d, status: 'connected' } : d),
              );

              // Move to SETUP after BLE handshake is received
              setStep(EAddDeviceStep.SETUP);
            }
          }
          catch (e) {
            console.error('Failed to parse handshake', e);
          }
        }
      },
    );

    const handlerStateUpdate = BleManager.onDidUpdateState(
      ({ state }) => {
        if (state === 'off' || state === 'turning_off') {
          setIsScanning(false);
          isScanningRef.current = false;
          showErrorMessage(translate('base.bluetoothOff'));
          Linking.openSettings();
        }
        else if (state === 'on') {
          startScan();
        }
      },
    );

    // Cleanup
    return () => {
      handlerDiscover.remove();
      handlerStop.remove();
      handlerValueUpdate.remove();
      handlerStateUpdate.remove();
      bleService.stopScan();

      if (rescanTimerRef.current) {
        clearTimeout(rescanTimerRef.current);
      }

      if (connectedDeviceIdRef.current) {
        bleService.stopNotification(connectedDeviceIdRef.current).catch(() => {});
        bleService.disconnect(connectedDeviceIdRef.current).catch(() => {});
        connectedDeviceIdRef.current = null;
      }

      // Also cleanup TCP if applicable
      tcpClient.disconnect();
    };
  }, []);

  // ─── Device Selection → Connect ───────────
  const selectDevice = (device: TDeviceResult) => {
    setSelectedDevice(device);
    // BLE scanned device → connect directly (skip LED confirm)
    setPairingMode(EPairingMode.BLE);
    connectDeviceBLE(device);
  };

  // ─── LED Confirm → Choose pairing mode ────────
  const choosePairingMode = (mode: EPairingMode) => {
    setPairingMode(mode);
    if (mode === EPairingMode.BLE) {
      if (!selectedDevice) {
        // No device selected (came from "Add manually") — go back to scan first
        showErrorMessage(translate('base.noDeviceSelected'));
        setStep(EAddDeviceStep.SCANNING);
        return;
      }
      connectDeviceBLE(selectedDevice);
    }
    else {
      setStep(EAddDeviceStep.CONNECTING); // Show AP connect guide
    }
  };

  // ─── BLE Connect ──────────────────────────────
  const connectDeviceBLE = async (device: TDeviceResult) => {
    try {
      setStep(EAddDeviceStep.CONNECTING);
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'connecting' } : d));
      await bleService.connect(device.id);
      await bleService.retrieveServices(device.id);

      // Request 247 (standard max for most ESP/BL602 chips without extended lengths)
      // Requesting 512 can cause buffer overflows and chip reboots ("tít tiếp")
      await bleService.requestMTU(device.id, 247);

      // Delay to ensure MTU exchange completes before CCC notification is enabled.
      // If CCC is enabled too early, MTU is still 23, and the ~100-byte Handshake is dropped/crashed.
      await new Promise(resolve => setTimeout(resolve, 500));

      await bleService.startNotification(device.id);
      connectedDeviceIdRef.current = device.id;
      // Step transition happens in handlerValueUpdate after handshake
    }
    catch (error) {
      console.error('BLE connection failed', error);
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'failed' } : d));
      showErrorMessage(translate('base.bleConnectionError'));
      setStep(EAddDeviceStep.SCANNING);
    }
  };

  // ─── AP Connect (TCP Socket) ──────────────────
  const connectDeviceAP = async () => {
    try {
      setIsConnectingAP(true);

      // TCP connect to chip's AP gateway
      await tcpClient.connect();

      // Send handshake request
      await tcpClient.send(JSON.stringify({ cmd: 'handshake', app_version: '1.0' }));

      // Receive handshake response
      const response = await tcpClient.receive();
      const handshakeData = JSON.parse(response);

      if (handshakeData.mac && handshakeData.session && handshakeData.nonce) {
        cryptoService.initSession({
          mac: handshakeData.mac,
          session: handshakeData.session,
          nonce: handshakeData.nonce,
          deviceCode: handshakeData.pid,
          partnerCode: handshakeData.cid,
        });

        setStep(EAddDeviceStep.SETUP);
      }
      else {
        throw new Error('Invalid handshake response');
      }
    }
    catch (error) {
      console.error('AP connection failed', error);
      showErrorMessage(translate('base.wifiConnectionError'));
    }
    finally {
      setIsConnectingAP(false);
    }
  };

  // ─── Submit Config (BLE or AP) ────────────────
  const submitDeviceConfig = async () => {
    const device = selectedDevice;

    try {
      setStep(EAddDeviceStep.CONFIGURING);
      setConfiguringStatus(translate('base.registeringDevice'));

      if (!cryptoService.getSessionNonce()) {
        showErrorMessage(translate('base.noSessionError'));
        setStep(EAddDeviceStep.SETUP);
        return;
      }

      const macAddress = cryptoService.getMac();
      const deviceCode = cryptoService.getDeviceCode();
      const partnerCode = cryptoService.getPartnerCode();

      if (!deviceCode || !partnerCode || !macAddress) {
        showErrorMessage(translate('base.unsupportedDevice'));
        setStep(EAddDeviceStep.SETUP);
        return;
      }

      if (!selectedHomeId) {
        showErrorMessage(translate('base.noHomeSelected'));
        setStep(EAddDeviceStep.SETUP);
        return;
      }

      // Step 1: Register device on server (auto-assign active home)
      const response = await registerDevice({
        protocol: EDeviceProtocol.MQTT,
        identifier: macAddress,
        deviceCode,
        partnerCode,
        name: deviceName || device?.name || 'Device',
        homeId: selectedHomeId,
      });

      const serverResponse = response.data;

      // Step 2: Build config payload and encrypt
      setConfiguringStatus(translate('base.sendingConfig'));

      const payload = {
        cmd: 'set_wifi',
        wifi_ssid: wifiSsid,
        wifi_pass: wifiPass,
        mqtt_broker: serverResponse.mqtt_broker,
        mqtt_token_device: serverResponse.mqtt_token_device,
        mqtt_username: serverResponse.mqtt_username,
        mqtt_pass: serverResponse.mqtt_pass,
        license_days: serverResponse.license_days,
      };

      const encryptedBytes = cryptoService.encryptAES128ECB(JSON.stringify(payload));

      // Step 3: Send config via BLE or TCP
      if (pairingMode === EPairingMode.BLE && device) {
        // Chip xử lý config → ACK → save → reboot
        // Disconnect tại bất kỳ thời điểm nào = config đã nhận thành công
        try {
          await bleService.writeChunked(device.id, encryptedBytes);

          setConfiguringStatus(translate('base.waitingForDeviceAck'));
          const ackBytes = await bleService.waitForNotification(device.id, BLE_ACK_TIMEOUT);
          const ackData = JSON.parse(bleService.bytesToString(ackBytes));

          if (ackData.status !== 'ok') {
            throw new Error(ackData.message || 'Device rejected config');
          }

          await bleService.gracefulDisconnect(device.id);
        }
        catch {
          // Disconnect hoặc timeout = chip đã reboot = config thành công
        }
        connectedDeviceIdRef.current = null;
      }
      else {
        // AP mode — send via TCP socket
        await tcpClient.sendBytes(encryptedBytes);

        // Wait for ACK via TCP
        setConfiguringStatus(translate('base.waitingForDeviceAck'));
        const ackResponse = await tcpClient.receive();
        const ackData = JSON.parse(ackResponse);

        if (ackData.status !== 'ok') {
          throw new Error(ackData.message || 'Device rejected config');
        }

        tcpClient.disconnect();
      }

      // Success
      setStep(EAddDeviceStep.COMPLETE);
    }
    catch (error) {
      console.error('Failed to register or send config', error);
      showErrorMessage(translate('base.registerDeviceFailed'));
      setStep(EAddDeviceStep.SETUP);
    }
  };

  return {
    step,
    setStep,
    pairingMode,
    devices,
    isScanning,
    isConnectingAP,
    isRegistering,
    deviceName,
    setDeviceName,
    wifiSsid,
    setWifiSsid,
    wifiPass,
    setWifiPass,
    rotation,
    selectedDevice,
    configuringStatus,
    startScan,
    selectDevice,
    choosePairingMode,
    connectDeviceAP,
    submitDeviceConfig,
  };
}
