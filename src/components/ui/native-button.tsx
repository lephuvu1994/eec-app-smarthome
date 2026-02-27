import type { ButtonProps as AndroidButtonProps } from '@expo/ui/jetpack-compose';
import type { ButtonProps } from '@expo/ui/swift-ui';
import { Button as AndroidButton } from '@expo/ui/jetpack-compose';
import { Button } from '@expo/ui/swift-ui';

import { IS_IOS } from './utils';

export function NativeButton(props: ButtonProps | AndroidButtonProps) {
  if (IS_IOS) {
    return <Button {...(props as ButtonProps)} />;
  }
  else {
    return <AndroidButton {...(props as AndroidButtonProps)} />;
  }
}
