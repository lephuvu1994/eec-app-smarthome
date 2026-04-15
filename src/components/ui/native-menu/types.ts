import type { ViewStyle } from 'react-native';

// ─── Icon ───────────────────────────────────────────────────────────────────

export type TNativeMenuIcon = {
  /** SF Symbol name (iOS) */
  ios?: string;
  /** Not used currently — Android uses MaterialCommunityIcons from `androidIconName` in TMenuItem */
  android?: string;
};

// ─── Element types ───────────────────────────────────────────────────────────

export type TNativeMenuSeparator = {
  type: 'separator';
  key: string;
  isHidden?: boolean;
};

export type TNativeMenuGroup = {
  type: 'group';
  key: string;
  title?: string;
  items: TNativeMenuElement[];
  isHidden?: boolean;
};

export type TNativeMenuCheckbox = {
  type: 'checkbox';
  key: string;
  title: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  icon?: TNativeMenuIcon;
  /** MaterialCommunityIcons name for Android */
  androidIconName?: string;
  isDisabled?: boolean;
  isHidden?: boolean;
};

export type TNativeMenuItem = {
  type?: 'item';
  key: string;
  title: string;
  icon?: TNativeMenuIcon;
  /** MaterialCommunityIcons name for Android */
  androidIconName?: string;
  isDestructive?: boolean;
  isDisabled?: boolean;
  isHidden?: boolean;
  onPress?: () => void;
  /** Submenu items */
  children?: TNativeMenuElement[];
};

export type TNativeMenuElement
  = | TNativeMenuItem
    | TNativeMenuGroup
    | TNativeMenuSeparator
    | TNativeMenuCheckbox;

// ─── Props ───────────────────────────────────────────────────────────────────

export type TNativeMenuProps = {
  /** The React Native view rendered as trigger on Android. On iOS it's placed inside SwiftUI Host. */
  triggerComponent: React.ReactNode;
  elements: TNativeMenuElement[];
  menuTitle?: string;
  align?: 'start' | 'center' | 'end';
  style?: ViewStyle;
};
