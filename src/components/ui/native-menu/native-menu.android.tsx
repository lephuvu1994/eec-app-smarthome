// Android implementation using @expo/ui/jetpack-compose
// Renders a native Jetpack Compose DropdownMenu with MaterialCommunityIcons.

import type { TNativeMenuElement, TNativeMenuProps } from './types';
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Text as JCText,
} from '@expo/ui/jetpack-compose';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

// ─── Recursive item renderer ─────────────────────────────────────────────────

function renderItem(
  el: TNativeMenuElement,
  onClose: () => void,
): React.ReactNode {
  if (el.isHidden)
    return null;

  // Separators are not natively supported in JC DropdownMenu — skip
  if (el.type === 'separator')
    return null;

  // Groups: flatten items
  if (el.type === 'group') {
    return el.items.map(child => renderItem(child, onClose));
  }

  // Checkbox: render as regular item with checkmark in title
  if (el.type === 'checkbox') {
    return (
      <DropdownMenuItem
        key={el.key}
        onClick={() => {
          onClose();
          el.onValueChange(!el.value);
        }}
      >
        <DropdownMenuItem.Text>
          <JCText>{el.value ? `✓ ${el.title}` : el.title}</JCText>
        </DropdownMenuItem.Text>
        {el.androidIconName && (
          <DropdownMenuItem.LeadingIcon>
            <View>
              <MaterialCommunityIcons name={el.androidIconName as any} size={20} color="#6B7280" />
            </View>
          </DropdownMenuItem.LeadingIcon>
        )}
      </DropdownMenuItem>
    );
  }

  // Default: item
  return (
    <DropdownMenuItem
      key={el.key}
      onClick={() => {
        onClose();
        el.onPress?.();
      }}
    >
      <DropdownMenuItem.Text>
        <JCText>{el.title}</JCText>
      </DropdownMenuItem.Text>
      {el.androidIconName && (
        <DropdownMenuItem.LeadingIcon>
          <View>
            <MaterialCommunityIcons name={el.androidIconName as any} size={20} color="#6B7280" />
          </View>
        </DropdownMenuItem.LeadingIcon>
      )}
    </DropdownMenuItem>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NativeMenu({ triggerComponent, elements }: TNativeMenuProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={expanded}
        onDismissRequest={() => setExpanded(false)}
      >
        <DropdownMenu.Trigger>
          <TouchableOpacity onPress={() => setExpanded(true)} activeOpacity={0.7}>
            {triggerComponent}
          </TouchableOpacity>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {elements.map(el => renderItem(el, () => setExpanded(false)))}
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
