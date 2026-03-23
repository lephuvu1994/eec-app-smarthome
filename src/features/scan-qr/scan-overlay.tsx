import { Platform, StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

import { HEIGHT, WIDTH } from '@/components/ui/utils';

const CUTOUT_SIZE = 260;
const CORNER_RADIUS = 24;

export function ScanOverlay() {
  const x = WIDTH / 2 - CUTOUT_SIZE / 2;
  const y = HEIGHT / 2 - CUTOUT_SIZE / 2;

  return (
    <View
      pointerEvents="none"
      style={Platform.OS === 'android' ? { flex: 1 } : StyleSheet.absoluteFillObject}
    >
      <Svg
        width={WIDTH}
        height={HEIGHT}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <ClipPath id="cutout">
            {/* Outer full-screen rect */}
            <Rect width={WIDTH} height={HEIGHT} />
            {/* Inner rounded rect (cut out from overlay) */}
            <Path
              d={`M${x + CORNER_RADIUS},${y}
                  h${CUTOUT_SIZE - 2 * CORNER_RADIUS}
                  a${CORNER_RADIUS},${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS},${CORNER_RADIUS}
                  v${CUTOUT_SIZE - 2 * CORNER_RADIUS}
                  a${CORNER_RADIUS},${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS},${CORNER_RADIUS}
                  h-${CUTOUT_SIZE - 2 * CORNER_RADIUS}
                  a${CORNER_RADIUS},${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS},-${CORNER_RADIUS}
                  v-${CUTOUT_SIZE - 2 * CORNER_RADIUS}
                  a${CORNER_RADIUS},${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS},-${CORNER_RADIUS}
                  z`}
            />
          </ClipPath>
        </Defs>
        {/* Semi-transparent overlay with cutout hole */}
        <Rect
          width={WIDTH}
          height={HEIGHT}
          fill="black"
          fillOpacity={0.55}
          clipPath="url(#cutout)"
        />
      </Svg>
    </View>
  );
}
