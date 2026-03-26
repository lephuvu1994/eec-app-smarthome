import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import * as React from 'react';

import { EEntityDomain } from '@/lib/api/devices/device.service';

import { CurtainModalItem } from './curtain-modal-item';
import { SwitchModalItem } from './switch-modal-item';

/**
 * Factory component that routes the display of Modal mini-controls based on entity domain.
 */
export function ModalItemFactory({ device, entity }: { device: TDevice; entity: TDeviceEntity }) {
  switch (entity.domain) {
    case EEntityDomain.CURTAIN:
      return <CurtainModalItem device={device} entity={entity} />;
    
    // For many domains, a simple toggle is enough initially
    case EEntityDomain.SWITCH:
    case EEntityDomain.LIGHT:
    case EEntityDomain.BUTTON:
      return <SwitchModalItem device={device} entity={entity} />;
      
    // Default fallback is the generic switch layout
    default:
      return <SwitchModalItem device={device} entity={entity} />;
  }
}
