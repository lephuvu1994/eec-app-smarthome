import { useLocalSearchParams } from 'expo-router';
import { ClimateDetailScreen } from '@/features/devices/screens/climate-detail-screen';
import { CurtainDetailScreen } from '@/features/devices/screens/curtain-detail-screen';
import { FallbackDeviceScreen } from '@/features/devices/screens/fallback-device-screen';
import { LightDetailScreen } from '@/features/devices/screens/light-detail-screen';
import { SwitchDetailScreen } from '@/features/devices/screens/switch-detail-screen';

import { EEntityDomain } from '@/lib/api/devices/device.service';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';

export default function DeviceDetailRoute() {
  const { id, entityId } = useLocalSearchParams();
  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === id) : undefined;

  if (!device) {
    return <FallbackDeviceScreen message="Device not found" />;
  }

  const primaryEntity = getPrimaryEntities(device)[0];
  const domain = primaryEntity?.domain || 'unknown';

  // Phân luồng UI dựa trên Loại thiết bị (Domain của Entity chính)
  switch (domain) {
    case EEntityDomain.CURTAIN:
      return <CurtainDetailScreen deviceId={id as string} entityId={entityId as string | undefined} />;

    case EEntityDomain.SWITCH:
    case EEntityDomain.BUTTON:
      return <SwitchDetailScreen deviceId={id as string} entityId={entityId as string | undefined} />;

    case EEntityDomain.LIGHT:
      return <LightDetailScreen deviceId={id as string} entityId={entityId as string | undefined} />;

    case EEntityDomain.CLIMATE:
      return <ClimateDetailScreen deviceId={id as string} entityId={entityId as string | undefined} />;

    default:
      return (
        <FallbackDeviceScreen
          title={device.name}
          message={`Giao diện chi tiết cho thiết bị loại "${domain}" chưa được hỗ trợ.`}
        />
      );
  }
}
