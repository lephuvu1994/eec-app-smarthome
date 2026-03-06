import { EDeviceConnectStatus, TDevice } from "../../types/device";

export const listDevice: TDevice[] = [
    {
        id: '1',
        name: 'Trợ lý ảo Alexa',
        type: 'assistant',
        status: EDeviceConnectStatus.CONNECTED,
        image: require('@@/assets/device/alexa.png'),
    },
    {
        id: '2',
        name: 'Đèn',
        type: 'light',
        status: EDeviceConnectStatus.CONNECTED,
        image: require('@@/assets/device/light.png'),
    },
    {
        id: '3',
        name: 'Camera',
        type: 'camera',
        status: EDeviceConnectStatus.CONNECTED,
        image: require('@@/assets/device/camera.png'),
    }
  ]