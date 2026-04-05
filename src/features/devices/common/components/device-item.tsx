import type { TDeviceItemProps } from '../types';

import { useModal } from '@/components/ui/modal';
import { useDeviceConfig } from '@/features/devices/common/hooks/use-device-configs';
import { ETypeViewDevice } from '@/types/device';

import { useDeviceControl } from '../hooks/use-device-control';
import { DeviceControlModal } from '../modals/device-control-modal';
import { DeviceFullCard } from './device-full-card';
import { DeviceGridCard } from './device-grid-card';

/**
 * Entry component for device rendering.
 * Resolves device config → delegates to layout + modal.
 */
export function DeviceItem({ device, typeViewDevice, activeEntity, availableBleDevices }: TDeviceItemProps) {
  const config = useDeviceConfig(device.type);
  const modal = useModal();
  const control = useDeviceControl(device, activeEntity, { modal, config, availableBleDevices });
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
