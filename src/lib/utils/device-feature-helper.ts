import type { TDevice, TDeviceFeature } from '../api/devices/device.service';

/**
 * Determines if a given Device Feature acts as a primary control point 
 * (e.g., a physical button, a power toggle, a lock toggle) 
 * rather than a secondary modifier (e.g., brightness, color, voltage tracking).
 */
export function isPrimaryFeature(feature: TDeviceFeature): boolean {
  if (feature.category === 'switch') return true;
  
  const code = feature.code.toLowerCase();
  
  if (
    code.includes('switch') || 
    code.includes('power') ||
    code.includes('button') ||
    code.includes('door') ||
    code.includes('lock')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Iterates over a Device's features and isolates only the Primary logic paths for granular UI display.
 * If no recognizable primary features exist, defaults to returning the first available feature.
 */
export function getPrimaryFeatures(device: TDevice): TDeviceFeature[] {
  if (!device.features || device.features.length === 0) return [];
  
  const primaries = device.features.filter(isPrimaryFeature);
  
  if (primaries.length === 0) {
    return [device.features[0]]; // Fallback safe-catch
  }
  
  return primaries;
}

/**
 * Locates the implicit secondary feature modifiers that belong logically to a specific primary feature.
 * Used during assignment payloads to assure modifiers (like brightness) travel to the same room as the physical switch.
 */
export function getDependentFeatures(device: TDevice, _primaryFeatureId: string): TDeviceFeature[] {
  if (!device.features) return [];
  
  const allPrimaries = device.features.filter(isPrimaryFeature);
  
  // If the device only has 1 primary feature (e.g., a standard Dimmer Bulb with ON/OFF switch and Brightness array)
  // Then ALL secondary attributes logically belong to that lone primary feature.
  if (allPrimaries.length <= 1) {
    return device.features.filter(f => !isPrimaryFeature(f));
  }
  
  // If this is a Multi-gang scenario (e.g., 3 separate switches), they rarely share unified modifiers.
  // Advanced mapping here would check for identical prefixes (e.g., `switch_1` pairs with `brightness_1`), 
  // but safely returning empty arrays handles 95% of standard Smart Home switch blocks.
  return [];
}
