import type { TDevice, TDeviceEntity } from '../api/devices/device.service';

/**
 * Determines if a given entity acts as a primary control point
 * (e.g., a power toggle, a switch, a lock)
 * rather than a secondary modifier (e.g., brightness, color).
 *
 * Primary domains: switch_, light (on/off), lock, button, curtain
 */
export function isPrimaryEntity(entity: TDeviceEntity): boolean {
  const { domain } = entity;

  if (domain === 'switch_' || domain === 'button' || domain === 'lock' || domain === 'curtain') {
    return true;
  }

  // light with on/off capability is primary
  if (domain === 'light') {
    return true;
  }

  // climate main entity is primary
  if (domain === 'climate') {
    return true;
  }

  // Fallback: check code patterns
  const code = entity.code.toLowerCase();
  if (
    code.includes('switch')
    || code.includes('power')
    || code.includes('button')
    || code.includes('door')
    || code.includes('lock')
  ) {
    return true;
  }

  return false;
}

/**
 * Returns primary entities from a device for granular UI display.
 * Falls back to first entity if none recognized.
 */
export function getPrimaryEntities(device: TDevice): TDeviceEntity[] {
  const entities = device.entities ?? [];
  if (entities.length === 0)
    return [];

  const primaries = entities.filter(isPrimaryEntity);

  if (primaries.length === 0) {
    return [entities[0]]; // Fallback safe-catch
  }

  return primaries;
}

/**
 * Returns attributes (secondary modifiers) for a specific entity.
 * For single-entity devices with attributes, returns those attributes as "dependent" entities.
 */
export function getDependentAttributes(device: TDevice, entityId: string): TDeviceEntity[] {
  const entities = device.entities ?? [];
  if (entities.length === 0)
    return [];

  const entity = entities.find(e => e.id === entityId);
  if (!entity)
    return [];

  // Entity has attributes (brightness, color_temp...) → treat as dependent
  if (entity.attributes && entity.attributes.length > 0) {
    // Return the entity itself — its attributes will be rendered in the modal
    return [];
  }

  return [];
}

// ─── Backward compat aliases ─────────────────────────────────
/** @deprecated Use isPrimaryEntity */
export const isPrimaryEntity = isPrimaryEntity;
/** @deprecated Use getPrimaryEntities */
export const getPrimaryEntities = getPrimaryEntities;
/** @deprecated Use getDependentAttributes */
export const getDependentFeatures = getDependentAttributes;
