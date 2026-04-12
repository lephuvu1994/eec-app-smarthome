import type { TDeviceConfig } from '@/features/devices/common/types';
import type { TDevice, TDeviceEntity } from '@/types/device';

import * as React from 'react';

import { Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { isPrimaryEntity } from '@/lib/utils/device-entity-helper';

import { ModalItemFactory } from '../components/modal-item-factory';

type TDeviceControlModalProps = {
  modalRef: React.RefObject<any>;
  device: TDevice;
  activeEntity?: TDeviceEntity;
  config: TDeviceConfig;
};

export function DeviceControlModal({
  modalRef,
  device,
  activeEntity,
  config,
}: TDeviceControlModalProps) {
  const entities = device.entities ?? [];
  const primaryEntities = entities.filter(isPrimaryEntity);

  return (
    <Modal ref={modalRef} snapPoints={config.modalSnapPoints} title={device.name}>
      <View className="mt-4 flex-1 px-1">
        {activeEntity && (
          <Text className="mt-1 mb-4 text-sm font-medium text-neutral-500">
            {translate('base.module')}
            :
            {activeEntity.name || activeEntity.code}
          </Text>
        )}
        {primaryEntities.length > 0
          ? (
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {primaryEntities.map(entity => (
                  <ModalItemFactory key={entity.id} device={device} entity={entity} />
                ))}
              </View>
            )
          : (
              <Text className="mt-10 text-center text-neutral-500">
                {translate('base.noEntityControl')}
              </Text>
            )}
      </View>
    </Modal>
  );
}
