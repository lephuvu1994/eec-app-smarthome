import { useEffect, useState, useCallback, useRef } from 'react';
import { NativeEventEmitter, NativeModules, Alert } from 'react-native';
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { bleService, CHIP_TX_CHAR_UUID } from '@/lib/ble';
import { cryptoService } from '@/lib/crypto';
import { useRegisterDevice } from '@/hooks/use-register-device';
import { DeviceProtocol } from '@/lib/api/devices/device.service';
import { EAddDeviceStep, DeviceResult } from '../types';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const useAddDevice = () => {
  const [step, setStep] = useState<EAddDeviceStep>(EAddDeviceStep.SEARCH);
  const [devices, setDevices] = useState<DeviceResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  
  const rotation = useSharedValue(0);
  const { mutateAsync: registerDevice, isPending: isRegistering } = useRegisterDevice();

  const startScan = useCallback(async () => {
    if (isScanning) return;
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
      false
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
        if (!peripheral.name) return;
        setDevices((prev) => {
          if (prev.find((d) => d.id === peripheral.id)) return prev;
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
      }
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
                    cryptoService.initSession(
                        handshakeData.mac, 
                        handshakeData.session, 
                        handshakeData.nonce,
                        handshakeData.pid,
                        handshakeData.cid
                    );
                    
                    setDevices(prev => 
                        prev.map(d => d.id === peripheral ? { ...d, status: 'connected' } : d)
                    );
                }
            } catch (e) {
                console.error("Failed to parse handshake", e);
            }
        }
      }
    );

    return () => {
      handlerDiscover.remove();
      handlerStop.remove();
      handlerValueUpdate.remove();
      bleService.stopScan();
    };
  }, [startScan]);

  const connectDevice = async (device: DeviceResult) => {
    try {
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'connecting' } : d));
      await bleService.connect(device.id);
      await bleService.retrieveServices(device.id);
      await bleService.requestMTU(device.id, 512);
      setStep(EAddDeviceStep.SETUP);
    } catch (error) {
      console.error('Connection failed', error);
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'failed' } : d));
    }
  };

  const submitDeviceConfig = async (device: DeviceResult) => {
    try {
      if (!cryptoService.getSessionNonce()) {
        console.warn('Cannot send config: No session established.');
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
      
      const response = await registerDevice({
        protocol: DeviceProtocol.MQTT,
        identifier: macAddress,
        deviceCode: deviceCode, 
        partnerId: partnerId, 
        name: deviceName || device.name,
      });

      const serverResponse = response?.data || response;

      const payload = {
        cmd: "set_wifi",
        wifi_ssid: wifiSsid,
        wifi_pass: wifiPass,
        mqtt_broker: serverResponse.mqtt_broker || "mqtt.eec.com",
        mqtt_token_device: serverResponse.mqtt_token_device || "token_fallback",
        mqtt_username: serverResponse.mqtt_username || "user_fallback",
        mqtt_pass: serverResponse.mqtt_pass || "pass_fallback"
      };

      const encryptedBytes = cryptoService.encryptAES128ECB(JSON.stringify(payload));
      await bleService.writeWithoutResponse(device.id, encryptedBytes);
      
      Alert.alert('Thành công', 'Đã gửi cấu hình WiFi xuống mạch. Vui lòng chờ thiết bị khởi động lại và kết nối.');
    } catch (error) {
      console.error('Failed to register or send config', error);
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
};
