// Device image registry — maps device type/code to local asset
// Currently using .png, will be converted to .webp later
const DEVICE_IMAGES: Record<string, any> = {
  camera: require('@@/assets/device/camera.png'),
  light: require('@@/assets/device/light.png'),
  alexa: require('@@/assets/device/alexa.png'),
  assistant: require('@@/assets/device/alexa.png'),
};

/**
 * Resolve a device image by its type/code.
 * Falls back to a default image if the code is not mapped.
 */
export function getDeviceImage(code: string): any {
  return DEVICE_IMAGES[code] ?? DEVICE_IMAGES.camera;
}
