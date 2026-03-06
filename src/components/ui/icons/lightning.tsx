import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type LightningIconProps = {
  size?: number;
  color?: string;
};

export function LightningIcon({ size = 16, color = '#737373' }: LightningIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5379 2.27493L3.07458 8.42273C2.7561 8.86127 3.0694 9.47553 3.61101 9.47553H7.26223V13.3355C7.26223 13.9777 8.08536 14.2456 8.46283 13.7247L12.9262 7.5776C13.2446 7.13907 12.9314 6.52418 12.3897 6.52418H8.7379V2.66477C8.7379 2.02197 7.91536 1.75473 7.5379 2.27493Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
