import { TDevice, TDeviceEntity } from '@/types/device';

import * as React from 'react';

import { ClimateModalItem } from '@/features/devices/types/climate/components/climate-modal-item';

import { CurtainModalItem } from '@/features/devices/types/curtain/components/curtain-modal-item';
import { LightModalItem } from '@/features/devices/types/light/components/light-modal-item';
import { SwitchModalItem } from '@/features/devices/types/switch/components/switch-modal-item';
import { EEntityDomain } from '@/types/device';

/**
 * Factory component that routes the display of Modal mini-controls based on entity domain.
 */
export function ModalItemFactory({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  switch (entity.domain) {
    case EEntityDomain.CURTAIN:
      return <CurtainModalItem device={device} entity={entity} />;

    case EEntityDomain.LIGHT:
      return <LightModalItem device={device} entity={entity} />;

    case EEntityDomain.CLIMATE:
      return <ClimateModalItem device={device} entity={entity} />;

    case EEntityDomain.SWITCH:
    case EEntityDomain.BUTTON:
    default:
      return <SwitchModalItem device={device} entity={entity} />;
  }
}
