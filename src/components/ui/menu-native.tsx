import { ContextMenu as ContextMenuAndroid } from '@expo/ui/jetpack-compose';
import { ContextMenu, Host } from '@expo/ui/swift-ui';
import * as React from 'react';

import { IS_IOS } from './utils';

type TMenuNative = {
  containerStyle: { width: number; height: number };
  triggerComponent: React.ReactNode;
  listItem: any[];
};

export function MenuNative({ triggerComponent, listItem, containerStyle }: TMenuNative) {
  if (IS_IOS) {
    return (
      <Host style={containerStyle}>
        <ContextMenu>
          <ContextMenu.Items>
            {listItem.map((item: any) => {
              return <React.Fragment key={item.key}>{item.element}</React.Fragment>;
            })}
          </ContextMenu.Items>
          <ContextMenu.Trigger>{triggerComponent}</ContextMenu.Trigger>
        </ContextMenu>
      </Host>
    );
  }
  else {
    return (
      <ContextMenuAndroid style={containerStyle}>
        <ContextMenu.Items>
          {listItem.map((item: any) => {
            return <React.Fragment key={item.key}>{item.element}</React.Fragment>;
          })}
        </ContextMenu.Items>
        <ContextMenu.Trigger>{triggerComponent}</ContextMenu.Trigger>
      </ContextMenuAndroid>
    );
  }
}
