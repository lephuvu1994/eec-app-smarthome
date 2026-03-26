import { FallbackDeviceScreen } from './fallback-device-screen';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function LightDetailScreen({ deviceId, entityId: _entityId }: Props) {
  // TODO: Implement proper color picker and brightness slider logic
  return (
    <FallbackDeviceScreen 
      title="Bóng Đèn" 
      message={`Màn hình Điều khiển Đèn (Chỉnh màu/sáng) đang được bổ sung.\nThiết bị ID: ${deviceId}`} 
    />
  );
}
