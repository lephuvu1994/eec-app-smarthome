import type { TDeviceItemProps } from './types';

import { useModal } from '@/components/ui/modal';
import { useDeviceConfig } from '@/features/devices/hooks/use-device-configs';
import { ETypeViewDevice } from '@/types/device';

import { useDeviceControl } from './hooks/use-device-control';
import { DeviceFullCard } from './layouts/device-full-card';
import { DeviceGridCard } from './layouts/device-grid-card';
import { DeviceControlModal } from './modals/device-control-modal';

/**
 * Entry component for device rendering.
 * Resolves device config → delegates to layout + modal.
 */
export function DeviceItem({ device, typeViewDevice, activeEntity }: TDeviceItemProps) {
  const config = useDeviceConfig(device.type);
  const modal = useModal();
  const control = useDeviceControl(device, activeEntity, { modal, config });
  const resolvedCardType = config.viewType ?? typeViewDevice ?? ETypeViewDevice.HalfWidth;

  const Card = resolvedCardType === ETypeViewDevice.FullWidth
    ? DeviceFullCard
    : DeviceGridCard;

  return (
    <>
      <Card {...control} viewType={resolvedCardType} />
      <DeviceControlModal
        modalRef={modal.ref}
        device={device}
        activeEntity={activeEntity}
        config={config}
      />
    </>
  );
}
