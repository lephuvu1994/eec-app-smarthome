import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type SensorIconProps = {
  size?: number;
  color?: string;
};

export function SensorTempIcon({ size = 16, color = '#737373' }: SensorIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
    >
      {/* Thân nhiệt kế với Opacity 0.4 */}
      <Path
        opacity={0.4}
        d="M6.33362 3.99979V8.01493C5.52865 8.62333 5 9.57947 5 10.6666C5 12.5075 6.49254 14 8.3334 14C10.1743 14 11.6668 12.5075 11.6668 10.6666C11.6668 9.57947 11.1388 8.62333 10.3339 8.01493V3.99979C10.3339 2.89513 9.43807 2 8.3334 2C7.22873 2 6.33362 2.89513 6.33362 3.99979Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Nút tròn ở giữa */}
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.31483 10.6665C9.31483 11.2088 8.87503 11.6486 8.33276 11.6486C7.7899 11.6486 7.3501 11.2088 7.3501 10.6665C7.3501 10.1242 7.7899 9.68384 8.33276 9.68384C8.87503 9.68384 9.31483 10.1242 9.31483 10.6665Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vạch kẻ dọc */}
      <Path
        d="M8.3335 5.33331V9.68445"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
