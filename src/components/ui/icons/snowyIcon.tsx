import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function SnownyIcon({ color = '#06B6D4', ...props }: SvgProps & { color?: string }) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        d="M8.07617 2V5.95829"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        opacity="0.4"
        d="M9.74318 5.10876L9.80864 6.99624L11.4105 7.99664L9.80864 8.99704L9.74318 10.8846L8.07584 9.99744L6.40854 10.8846L6.34313 8.99704L4.74121 7.99664L6.34313 6.99624L6.40854 5.10876L8.07584 5.99586L9.74318 5.10876Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.74333 2.87012L8.07599 3.75722L6.40869 2.87012"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.07617 14V10.0417"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.74333 13.1302L8.07599 12.2432L6.40869 13.1302"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.2722 5L9.84424 6.97913"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.3529 6.87876L11.7509 5.87834L11.6855 3.99084"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.88037 11L6.30835 9.02087"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.46664 12.009L4.40124 10.1215L2.79932 9.12109"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.2722 11L9.84424 9.02087"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.3529 9.12122L11.7509 10.1216L11.6855 12.0091"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.88037 5L6.30835 6.97913"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.46664 3.99097L4.40124 5.87847L2.79932 6.87889"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
