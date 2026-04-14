import type { DimensionValue, ImageSourcePropType } from 'react-native';

// ── Animation Types ────────────────────────────────────────────────────────
/** How the door panel animates in the visualizer */
export type TCurtainAnimationType = 'slide_vertical' | 'slide_horizontal' | 'fold' | 'roll' | 'swing';

// ── Device Type Config ─────────────────────────────────────────────────────
/**
 * Each curtain "device type" bundles everything needed to render:
 * background image, door overlay image, door frame position, and animation.
 *
 * Add new types by adding entries to CURTAIN_DEVICE_TYPES below.
 */
export type TCurtainDeviceType = {
  /** Unique key, e.g. 'roller_shutter', 'garage_door' */
  id: string;
  /** i18n translation key for the display name */
  name: string;
  /** Thumbnail image for the picker carousel */
  thumbnail: ImageSourcePropType;
  /** Full background image (house with empty door hole) */
  bgImage: ImageSourcePropType;
  /** Door panel overlay image (slides over the door hole) */
  doorImage: ImageSourcePropType;
  /** Door hole position on the background (percentage-based for responsiveness) */
  doorFrame: {
    top: DimensionValue;
    left: DimensionValue;
    width: DimensionValue;
    height: DimensionValue;
  };
  numberDoor: number;
  /** Animation style for the door panel */
  animationType: TCurtainAnimationType;
};

// ── Registry ───────────────────────────────────────────────────────────────
export const CURTAIN_DEVICE_TYPES: TCurtainDeviceType[] = [
  {
    id: 'roller_shutter_7',
    name: 'deviceDetail.shutter.types.rollerShutter',
    thumbnail: require('@@/assets/device/cuacuon/webp/anh-7.webp'),
    bgImage: require('@@/assets/device/cuacuon/webp/anh-7.webp'),
    doorImage: require('@@/assets/device/cuacuon/webp/anh-7-cua.webp'),
    numberDoor: 1,
    doorFrame: { top: '43.4%', left: '24%', width: '52%', height: '45.3%' },
    animationType: 'slide_vertical',
  },
  {
    id: 'roller_shutter_1',
    name: 'deviceDetail.shutter.types.rollerShutter',
    thumbnail: require('@@/assets/device/cuacuon/webp/anh1.webp'),
    bgImage: require('@@/assets/device/cuacuon/webp/anh1.webp'),
    doorImage: require('@@/assets/device/cuacuon/webp/anh-cua1.webp'),
    numberDoor: 1,
    doorFrame: { top: '33.8%', left: '22.3%', width: '56%', height: '57.8%' },
    animationType: 'slide_vertical',
  },
  {
    id: 'roller_shutter_2',
    name: 'deviceDetail.shutter.types.rollerShutter',
    thumbnail: require('@@/assets/device/cuacuon/webp/anh2.webp'),
    bgImage: require('@@/assets/device/cuacuon/webp/anh2.webp'),
    doorImage: require('@@/assets/device/cuacuon/webp/anh-cua2.webp'),
    numberDoor: 2,
    doorFrame: { top: '53%', left: '15%', width: '35%', height: '40%' },
    animationType: 'swing',
  },
  // {
  //   id: 'roller_shutter_3',
  //   name: 'deviceDetail.shutter.types.rollerShutter',
  //   thumbnail: require('@@/assets/device/cuacuon/webp/anh3.webp'),
  //   bgImage: require('@@/assets/device/cuacuon/webp/anh3.webp'),
  //   doorImage: require('@@/assets/device/cuacuon/anh-cua1.png'),
  //   numberDoor: 1,
  //   doorFrame: { top: '33.8%', left: '26.3%', width: '47.8%', height: '59%' },
  //   animationType: 'slide_vertical',
  // },
  // {
  //   id: 'roller_shutter_4',
  //   name: 'deviceDetail.shutter.types.rollerShutter',
  //   thumbnail: require('@@/assets/device/cuacuon/webp/anh4.webp'),
  //   bgImage: require('@@/assets/device/cuacuon/webp/anh4.webp'),
  //   doorImage: require('@@/assets/device/cuacuon/anh-cua1.png'),
  //   numberDoor: 1,
  //   doorFrame: { top: '33.8%', left: '26.3%', width: '47.8%', height: '59%' },
  //   animationType: 'slide_vertical',
  // },
  // {
  //   id: 'roller_shutter_5',
  //   name: 'deviceDetail.shutter.types.rollerShutter',
  //   thumbnail: require('@@/assets/device/cuacuon/webp/anh5.webp'),
  //   bgImage: require('@@/assets/device/cuacuon/webp/anh5.webp'),
  //   doorImage: require('@@/assets/device/cuacuon/anh-cua1.png'),
  //   numberDoor: 1,
  //   doorFrame: { top: '33.8%', left: '26.3%', width: '47.8%', height: '59%' },
  //   animationType: 'slide_vertical',
  // },
  // {
  //   id: 'roller_shutter_6',
  //   name: 'deviceDetail.shutter.types.rollerShutter',
  //   thumbnail: require('@@/assets/device/cuacuon/webp/anh6.webp'),
  //   bgImage: require('@@/assets/device/cuacuon/webp/anh6.webp'),
  //   doorImage: require('@@/assets/device/cuacuon/anh-cua1.png'),
  //   numberDoor: 1,
  //   doorFrame: { top: '33.8%', left: '26.3%', width: '47.8%', height: '59%' },
  //   animationType: 'slide_vertical',
  // },
];

/** Default device type when none is selected */
export const DEFAULT_CURTAIN_TYPE_ID = 'roller_shutter_7';

/** Lookup a device type by ID, returns first entry if not found */
export function getCurtainDeviceType(id: string): TCurtainDeviceType {
  return CURTAIN_DEVICE_TYPES.find(t => t.id === id) ?? CURTAIN_DEVICE_TYPES[0];
}
