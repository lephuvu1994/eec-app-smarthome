import type { DeviceResult } from '../types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, NativeEventEmitter, NativeModules } from 'react-native';
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useRegisterDevice } from '@/hooks/use-register-device';
import { DeviceProtocol } from '@/lib/api/devices/device.service';
import { bleService, CHIP_TX_CHAR_UUID } from '@/lib/ble';
import { cryptoService } from '@/lib/crypto';
import { EAddDeviceStep } from '../types';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export function useAddDevice() {
  const [step, setStep] = useState<EAddDeviceStep>(EAddDeviceStep.SEARCH);
  const [devices, setDevices] = useState<DeviceResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');

  const rotation = useSharedValue(0);
  const { mutateAsync: registerDevice, isPending: isRegistering } = useRegisterDevice();

  // Track connected device ID for cleanup
  const connectedDeviceIdRef = useRef<string | null>(null);

  const startScan = useCallback(async () => {
    if (isScanning)
      return;
    setDevices([]);
    setIsScanning(true);
    await bleService.startScan(10);
  }, [isScanning]);

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
    };

    initBle();

    const handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral) => {
        if (!peripheral.name)
          return;
        setDevices((prev) => {
          if (prev.some(d => d.id === peripheral.id))
            return prev;
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

              // Bug 2 fix: Only move to SETUP after handshake is received
              setStep(EAddDeviceStep.SETUP);
            }
          }
          catch (e) {
            console.error('Failed to parse handshake', e);
          }
        }
      },
    );

    // Bug 3 fix: Cleanup BLE connection on unmount
    return () => {
      handlerDiscover.remove();
      handlerStop.remove();
      handlerValueUpdate.remove();
      bleService.stopScan();

      // Disconnect if we have an active connection
      if (connectedDeviceIdRef.current) {
        bleService.stopNotification(connectedDeviceIdRef.current).catch(() => {});
        bleService.disconnect(connectedDeviceIdRef.current).catch(() => {});
        connectedDeviceIdRef.current = null;
      }
    };
  }, [startScan, rotation]);

  const connectDevice = async (device: DeviceResult) => {
    try {
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'connecting' } : d));
      await bleService.connect(device.id);
      await bleService.retrieveServices(device.id);
      await bleService.requestMTU(device.id, 512);

      // Bug 1 fix: Subscribe to notifications on TX characteristic
      await bleService.startNotification(device.id);
      connectedDeviceIdRef.current = device.id;

      // Bug 2 fix: DON'T set step here — wait for handshake in the event handler above
      // setStep(EAddDeviceStep.SETUP) is called in handlerValueUpdate after handshake
    }
    catch (error) {
      console.error('Connection failed', error);
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'failed' } : d));
      Alert.alert('Lỗi kết nối', 'Không thể kết nối thiết bị. Vui lòng thử lại.');
    }
  };

  // Flow restructure: submitDeviceConfig is called directly from SETUP step (after WiFi form)
  // Room assignment is optional and happens AFTER this
  const submitDeviceConfig = async (device: DeviceResult) => {
    try {
      if (!cryptoService.getSessionNonce()) {
        console.warn('Cannot send config: No session established.');
        Alert.alert('Lỗi', 'Chưa thiết lập phiên kết nối. Vui lòng kết nối lại thiết bị.');
        return;
      }

      const macAddress = cryptoService.getMac();
      const deviceCode = cryptoService.getDeviceCode();
      const partnerId = cryptoService.getPartnerId();

      if (!deviceCode || !partnerId || !macAddress) {
        Alert.alert('Lỗi', 'Không hỗ trợ thiết bị này. Vui lòng thử lại thiết bị tương thích.');
        setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'failed' } : d));
        return;
      }

      // Step 1: Register device on server (without room — room is optional)
      const response = await registerDevice({
        protocol: DeviceProtocol.MQTT,
        identifier: macAddress,
        deviceCode,
        partnerId,
        name: deviceName || device.name,
      });

      const serverResponse = response.data;

      // Step 2: Build config payload and encrypt
      const payload = {
        cmd: 'set_wifi',
        wifi_ssid: wifiSsid,
        wifi_pass: wifiPass,
        mqtt_broker: serverResponse.mqtt_broker || 'mqtt.eec.com',
        mqtt_token_device: serverResponse.mqtt_token_device || 'token_fallback',
        mqtt_username: serverResponse.mqtt_username || 'user_fallback',
        mqtt_pass: serverResponse.mqtt_pass || 'pass_fallback',
      };

      const encryptedBytes = cryptoService.encryptAES128ECB(JSON.stringify(payload));

      // Step 3: Send encrypted config to chip via BLE
      await bleService.writeWithoutResponse(device.id, encryptedBytes);

      // Success — move to optional room assignment
      setStep(EAddDeviceStep.ROOM_ASSIGN);
    }
    catch (error) {
      // Bug 4 fix: Show user-facing error alert
      console.error('Failed to register or send config', error);
      Alert.alert('Lỗi', 'Không thể đăng ký thiết bị. Vui lòng thử lại.');
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'failed' } : d));
    }
  };

  return {
    step,
    setStep,
    devices,
    isScanning,
    deviceName,
    setDeviceName,
    wifiSsid,
    setWifiSsid,
    wifiPass,
    setWifiPass,
    rotation,
    isRegistering,
    startScan,
    connectDevice,
    submitDeviceConfig,
  };
}
