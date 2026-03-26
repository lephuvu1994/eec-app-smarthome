import { FallbackDeviceScreen } from './fallback-device-screen';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function ClimateDetailScreen({ deviceId, entityId: _entityId }: Props) {
  // TODO: Implement AC controller with modes, temp radial dial, fan speed
  return (
    <FallbackDeviceScreen 
      title="Điều Hòa (Bản nâng cao)" 
      message={`Màn hình chuyên sâu Điều Hòa (Nhiệt độ, Quạt, Lịch) đang được bổ sung.\nThiết bị ID: ${deviceId}`} 
    />
  );
}
