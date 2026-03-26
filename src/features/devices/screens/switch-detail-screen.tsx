import { FallbackDeviceScreen } from './fallback-device-screen';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function SwitchDetailScreen({ deviceId, entityId: _entityId }: Props) {
  // TODO: Implement custom switch overview, such as energy consumption graphing
  return (
    <FallbackDeviceScreen 
      title="Công Tắc" 
      message={`Màn hình thống kê Công Tắc đang được bổ sung.\nThiết bị ID: ${deviceId}`} 
    />
  );
}
