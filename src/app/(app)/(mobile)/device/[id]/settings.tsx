import { useLocalSearchParams } from 'expo-router';
import { FallbackDeviceScreen } from '@/features/devices/management/settings/fallback-device-screen';
import { LightSettingsScreen } from '@/features/devices/types/light/screens/light-settings-screen';
import { SwitchSettingsScreen } from '@/features/devices/types/switch/screens/switch-settings-screen';
import { EEntityDomain } from '@/lib/api/devices/device.service';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useDeviceStore } from '@/stores/device/device-store';

export default function DeviceSettingsRoute() {
  const { id } = useLocalSearchParams();
  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === id) : undefined;

  if (!device) {
    return <FallbackDeviceScreen message="Device not found" />;
  }

  const primaryEntity = getPrimaryEntities(device)[0];
  const domain = primaryEntity?.domain || 'unknown';

  switch (domain) {
    case EEntityDomain.SWITCH:
    case EEntityDomain.BUTTON:
      return <SwitchSettingsScreen deviceId={id as string} />;

    case EEntityDomain.LIGHT:
      return <LightSettingsScreen deviceId={id as string} />;

    default:
      return (
        <FallbackDeviceScreen
          title="Cài đặt"
          message={`Thiết lập cấu hình nâng cao cho thiết bị "${domain}" chưa được hỗ trợ.`}
        />
      );
  }
}
