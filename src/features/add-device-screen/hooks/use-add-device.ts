import type { DeviceResult } from '../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, NativeEventEmitter, NativeModules } from 'react-native';
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useRegisterDevice } from '@/hooks/use-register-device';
import { DeviceProtocol } from '@/lib/api/devices/device.service';
import { bleService, CHIP_TX_CHAR_UUID } from '@/lib/ble';
import { cryptoService } from '@/lib/crypto';
import { tcpClient } from '../lib/tcp-client';
import { EAddDeviceStep, EPairingMode } from '../types';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export function useAddDevice() {
  const [step, setStep] = useState<EAddDeviceStep>(EAddDeviceStep.SCANNING);
  const [pairingMode, setPairingMode] = useState<EPairingMode>(EPairingMode.BLE);
  const [devices, setDevices] = useState<DeviceResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectingAP, setIsConnectingAP] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceResult | null>(null);
  const [configuringStatus, setConfiguringStatus] = useState('');

  const rotation = useSharedValue(0);
  const { mutateAsync: registerDevice, isPending: isRegistering } = useRegisterDevice();

  // Track connected device ID for cleanup
  const connectedDeviceIdRef = useRef<string | null>(null);
  const isScanningRef = useRef(false);

  const startScan = useCallback(async () => {
    if (isScanningRef.current)
      return;
    setDevices([]);
    setIsScanning(true);
    isScanningRef.current = true;
    await bleService.startScan(10);
  }, []);

  // ─── BLE Event Listeners ───────────────────
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3500,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    const initBle = async () => {
      const allowed = await bleService.requestPermissions();
      if (allowed) {
        await bleService.enableBluetooth();
        startScan();
      }
      else {
        Alert.alert(
          'Cần quyền Bluetooth',
          'Vui lòng vào Cài đặt để cho phép ứng dụng truy cập Bluetooth.',
          [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
      }
    };

    initBle();

    const handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral) => {
        if (!peripheral.name) return;
        setDevices((prev) => {
          if (prev.some(d => d.id === peripheral.id)) return prev;
          return [
            ...prev,
            {
              id: peripheral.id,
              name: peripheral.name,
              status: 'connecting',
              imageUrl: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=200&h=200&fit=crop',
              angle: Math.random() * 360,
              radius: 0.5 + Math.random() * 0.4,
            },
          ];
        });
      },
    );

    const handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', () => {
      setIsScanning(false);
      isScanningRef.current = false;
    });

    const handlerValueUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
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
                partnerId: handshakeData.cid,
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

    const handlerStateUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateState',
      ({ state }: { state: string }) => {
        if (state === 'off' || state === 'turning_off') {
          setIsScanning(false);
          isScanningRef.current = false;
          Alert.alert(
            'Bluetooth đã tắt',
            'Vui lòng bật Bluetooth để tìm kiếm thiết bị.',
            [
              { text: 'Huỷ', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ],
          );
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

      if (connectedDeviceIdRef.current) {
        bleService.stopNotification(connectedDeviceIdRef.current).catch(() => {});
        bleService.disconnect(connectedDeviceIdRef.current).catch(() => {});
        connectedDeviceIdRef.current = null;
      }

      // Also cleanup TCP if applicable
      tcpClient.disconnect();
    };
  }, []);

  // ─── Device Selection → LED Confirm ───────────
  const selectDevice = (device: DeviceResult) => {
    setSelectedDevice(device);
    setStep(EAddDeviceStep.LED_CONFIRM);
  };

  // ─── LED Confirm → Choose pairing mode ────────
  const choosePairingMode = (mode: EPairingMode) => {
    setPairingMode(mode);
    if (mode === EPairingMode.BLE) {
      connectDeviceBLE();
    }
    else {
      setStep(EAddDeviceStep.CONNECTING); // Show AP connect guide
    }
  };

  // ─── BLE Connect ──────────────────────────────
  const connectDeviceBLE = async () => {
    if (!selectedDevice) return;
    const device = selectedDevice;

    try {
      setStep(EAddDeviceStep.CONNECTING);
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'connecting' } : d));
      await bleService.connect(device.id);
      await bleService.retrieveServices(device.id);
      await bleService.requestMTU(device.id, 512);
      await bleService.startNotification(device.id);
      connectedDeviceIdRef.current = device.id;
      // Step transition happens in handlerValueUpdate after handshake
    }
    catch (error) {
      console.error('BLE connection failed', error);
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'failed' } : d));
      Alert.alert('Lỗi kết nối', 'Không thể kết nối thiết bị qua BLE. Vui lòng thử lại.');
      setStep(EAddDeviceStep.LED_CONFIRM);
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
          partnerId: handshakeData.cid,
        });

        setStep(EAddDeviceStep.SETUP);
      }
      else {
        throw new Error('Invalid handshake response');
      }
    }
    catch (error) {
      console.error('AP connection failed', error);
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối với thiết bị qua Wi-Fi. Đảm bảo bạn đã kết nối mạng WiFi của thiết bị.',
      );
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
      setConfiguringStatus('Đang đăng ký thiết bị...');

      if (!cryptoService.getSessionNonce()) {
        Alert.alert('Lỗi', 'Chưa thiết lập phiên kết nối. Vui lòng kết nối lại thiết bị.');
        setStep(EAddDeviceStep.SETUP);
        return;
      }

      const macAddress = cryptoService.getMac();
      const deviceCode = cryptoService.getDeviceCode();
      const partnerId = cryptoService.getPartnerId();

      if (!deviceCode || !partnerId || !macAddress) {
        Alert.alert('Lỗi', 'Không hỗ trợ thiết bị này.');
        setStep(EAddDeviceStep.SETUP);
        return;
      }

      // Step 1: Register device on server
      const response = await registerDevice({
        protocol: DeviceProtocol.MQTT,
        identifier: macAddress,
        deviceCode,
        partnerId,
        name: deviceName || device?.name || 'Device',
      });

      const serverResponse = response.data;

      // Step 2: Build config payload and encrypt
      setConfiguringStatus('Đang gửi cấu hình...');

      const payload = {
        cmd: 'set_wifi',
        wifi_ssid: wifiSsid,
        wifi_pass: wifiPass,
        mqtt_broker: serverResponse.mqtt_broker,
        mqtt_token_device: serverResponse.mqtt_token_device,
        mqtt_username: serverResponse.mqtt_username,
        mqtt_pass: serverResponse.mqtt_pass,
      };

      const encryptedBytes = cryptoService.encryptAES128ECB(JSON.stringify(payload));

      // Step 3: Send config via BLE or TCP
      if (pairingMode === EPairingMode.BLE && device) {
        await bleService.writeWithoutResponse(device.id, encryptedBytes);
      }
      else {
        // AP mode — send via TCP socket
        await tcpClient.sendBytes(encryptedBytes);
        tcpClient.disconnect(); // Chip will auto-reset
      }

      // Success
      setStep(EAddDeviceStep.COMPLETE);
    }
    catch (error) {
      console.error('Failed to register or send config', error);
      Alert.alert('Lỗi', 'Không thể đăng ký thiết bị. Vui lòng thử lại.');
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
