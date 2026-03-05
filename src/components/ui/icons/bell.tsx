import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function BellIcon({ color = '#737373', ...props }: SvgProps & { color?: string }) {
  return (
    <Svg width="16" height="18" viewBox="0 0 16 18" fill="none" {...props}>
      <Path
        d="M9.57399 16.2143C8.43721 17.4766 6.66387 17.4916 5.51622 16.2143M7.58333 13.7064C12.2827 13.7064 14.4567 13.1035 14.6667 10.6838C14.6667 8.26566 13.151 8.42116 13.151 5.45426C13.151 3.13678 10.9544 0.5 7.58333 0.5C4.21231 0.5 2.01571 3.13678 2.01571 5.45426C2.01571 8.42116 0.5 8.26566 0.5 10.6838C0.710794 13.1127 2.88481 13.7064 7.58333 13.7064Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
