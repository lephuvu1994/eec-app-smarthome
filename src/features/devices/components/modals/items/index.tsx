import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import * as React from 'react';

import { EEntityDomain } from '@/lib/api/devices/device.service';

import { ClimateModalItem } from './climate-modal-item';
import { CurtainModalItem } from './curtain-modal-item';
import { LightModalItem } from './light-modal-item';
import { SwitchModalItem } from './switch-modal-item';

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
