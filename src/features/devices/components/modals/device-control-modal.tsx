import type { TDeviceConfig } from '../types';
import type { TDevice, TDeviceEntity } from '@/lib/api/devices/device.service';

import * as React from 'react';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { translate } from '@/lib/i18n';
import { isPrimaryEntity } from '@/lib/utils/device-feature-helper';

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
        <Text className="mb-1 text-xl font-bold text-neutral-900 dark:text-white">
          {device.name}
        </Text>
        {activeEntity && (
          <Text className="mb-4 text-sm font-medium text-neutral-500">
            {translate('base.module')}
            :
            {activeEntity.name || activeEntity.code}
          </Text>
        )}
        {primaryEntities.length > 0
          ? (
              <View className="flex-row flex-wrap gap-3">
                {primaryEntities.map((entity) => {
                  const entityOn = entity.currentState === 1 || entity.state === 1;
                  return (
                    <TouchableOpacity
                      key={entity.id}
                      className={`h-24 min-w-[45%] flex-1 justify-between rounded-xl p-3 ${entityOn ? 'bg-[#A3EC3E]' : 'bg-neutral-100 dark:bg-neutral-800'}`}
                      onPress={() => {
                        // TODO: Toggle entity via socket
                        console.log('Toggle:', entity.code);
                      }}
                    >
                      <View className={`size-3 rounded-full ${entityOn ? 'bg-white' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                      <Text className={`text-lg font-semibold ${entityOn ? 'text-black' : 'text-neutral-800 dark:text-white'}`}>
                        {entity.name || entity.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          : (
              <Text className="mt-10 text-center text-neutral-500">
                {translate('base.noFeatureControl')}
              </Text>
            )}
      </View>
    </Modal>
  );
}
