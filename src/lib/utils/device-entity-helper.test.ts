import { describe, expect, it } from '@jest/globals';
import {
  getDependentAttributes,
  getPrimaryEntities,
  isPrimaryEntity,
} from './device-entity-helper';
import type { TDevice, TDeviceEntity } from '../api/devices/device.service';

const mockEntity = (domain: string, code: string, attributes: any[] = []): TDeviceEntity => ({
  id: `entity-${code}`,
  domain,
  code,
  name: `Test ${domain} ${code}`,
  state: null,
  readOnly: false,
  attributes,
} as TDeviceEntity);

describe('device-entity-helper', () => {
  describe('isPrimaryEntity', () => {
    it('should identify switch_ as primary', () => {
      expect(isPrimaryEntity(mockEntity('switch_', 'ch1'))).toBe(true);
    });

    it('should identify light as primary', () => {
      expect(isPrimaryEntity(mockEntity('light', 'light_1'))).toBe(true);
    });

    it('should identify curtain as primary', () => {
      expect(isPrimaryEntity(mockEntity('curtain', 'curtain_1'))).toBe(true);
    });

    it('should fallback to true if code contains primary keywords', () => {
      expect(isPrimaryEntity(mockEntity('unknown', 'main_switch_1'))).toBe(true);
      expect(isPrimaryEntity(mockEntity('unknown', 'front_door_lock'))).toBe(true);
    });

    it('should return false for pure sensors without matching keywords', () => {
      expect(isPrimaryEntity(mockEntity('sensor', 'temp_1'))).toBe(false);
    });
  });

  describe('getPrimaryEntities', () => {
    it('should return only primary entities', () => {
      const device: TDevice = {
        id: 'dev-1',
        name: 'Device 1',
        token: 'token-1',
        entities: [
          mockEntity('switch_', 'switch_1'),
          mockEntity('sensor', 'sensor_1'),
          mockEntity('light', 'light_1'),
        ],
      } as TDevice;

      const primaries = getPrimaryEntities(device);
      expect(primaries).toHaveLength(2);
      expect(primaries.map(e => e.code)).toEqual(['switch_1', 'light_1']);
    });

    it('should fallback to returning first entity if no primary found', () => {
      const device: TDevice = {
        id: 'dev-1',
        name: 'Device 1',
        token: 'token-1',
        entities: [
          mockEntity('sensor', 'sensor_1'),
          mockEntity('sensor', 'sensor_2'),
        ],
      } as TDevice;

      const primaries = getPrimaryEntities(device);
      expect(primaries).toHaveLength(1);
      expect(primaries[0].code).toBe('sensor_1');
    });

    it('should return empty if device has no entities', () => {
      expect(getPrimaryEntities({ entities: [] } as any)).toEqual([]);
      expect(getPrimaryEntities({} as any)).toEqual([]);
    });
  });

  describe('getDependentAttributes', () => {
    it('should return empty array for entities with or without attributes (managed by modal now)', () => {
      const device: TDevice = {
        id: 'dev-1',
        name: 'test',
        token: 'test',
        entities: [
          mockEntity('light', 'light_1', [{ key: 'brightness', valueType: 'NUMBER' }]),
        ],
      } as TDevice;

      expect(getDependentAttributes(device, 'entity-light_1')).toEqual([]);
    });

    it('should return empty array if entity not found', () => {
      const device: TDevice = {
        id: 'dev-1',
        name: 'test',
        token: 'test',
        entities: [mockEntity('light', 'light_1')],
      } as TDevice;

      expect(getDependentAttributes(device, 'entity-not-found')).toEqual([]);
    });
  });
});
