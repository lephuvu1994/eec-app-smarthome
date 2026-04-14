// iOS implementation using @expo/ui/swift-ui
// Renders a native SwiftUI Menu with SF Symbol icons and proper grouping.

import type { TNativeMenuElement, TNativeMenuProps } from './types';
import { Button, Divider, Host, Menu, Section } from '@expo/ui/swift-ui';
import * as React from 'react';

// ─── Recursive element renderer ──────────────────────────────────────────────

function renderElement(el: TNativeMenuElement): React.ReactNode {
  if (el.isHidden)
    return null;

  if (el.type === 'separator') {
    return <Divider key={el.key} />;
  }

  if (el.type === 'group') {
    return (
      <Section key={el.key}>
        {el.items.map(renderElement)}
      </Section>
    );
  }

  if (el.type === 'checkbox') {
    // SwiftUI doesn't have a native checkbox menu item — render as toggle button
    return (
      <Button
        key={el.key}
        label={el.isHidden ? '' : `${el.value ? '✓ ' : ''}${el.title}`}
        systemImage={el.icon?.ios as any}
        onPress={() => el.onValueChange(!el.value)}
      />
    );
  }

  // Default: item (with optional submenu)
  const item = el;

  if (item.children && item.children.length > 0) {
    return (
      <Menu key={item.key} label={item.title} systemImage={item.icon?.ios as any}>
        {item.children.map(renderElement)}
      </Menu>
    );
  }

  return (
    <Button
      key={item.key}
      label={item.title}
      systemImage={item.icon?.ios as any}
      role={item.isDestructive ? 'destructive' : undefined}
      onPress={item.onPress}
    />
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NativeMenu({
  triggerComponent,
  elements,
  menuTitle,
}: TNativeMenuProps) {
  return (
    <Host matchContents>
      <Menu
        label={triggerComponent as any}
        systemImage={undefined}
      >
        {menuTitle
          ? (
              <Section>
                {elements.map(renderElement)}
              </Section>
            )
          : elements.map(renderElement)}
      </Menu>
    </Host>
  );
}
