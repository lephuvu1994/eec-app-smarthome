export const SHUTTER_BACKGROUNDS = [
  { id: '1', source: require('@@/assets/device/cuacuon/webp/anh1.webp') },
  { id: '2', source: require('@@/assets/device/cuacuon/webp/anh2.webp') },
  { id: '3', source: require('@@/assets/device/cuacuon/webp/anh3.webp') },
  { id: '4', source: require('@@/assets/device/cuacuon/webp/anh4.webp') },
  { id: '5', source: require('@@/assets/device/cuacuon/webp/anh5.webp') },
  { id: '6', source: require('@@/assets/device/cuacuon/webp/anh6.webp') },
];

export function getShutterBackgroundSource(id: string) {
  const bg = SHUTTER_BACKGROUNDS.find(b => b.id === id);
  return bg ? bg.source : SHUTTER_BACKGROUNDS[0].source;
}
