// Cross-platform NativeMenu barrel export.
// Metro bundler auto-selects the correct platform file:
//   native-menu.ios.tsx  → iOS (SwiftUI via @expo/ui/swift-ui)
//   native-menu.android.tsx → Android (Jetpack Compose via @expo/ui/jetpack-compose)

export { NativeMenu } from './native-menu';

export type {
  TNativeMenuCheckbox,
  TNativeMenuElement,
  TNativeMenuGroup,
  TNativeMenuIcon,
  TNativeMenuItem,
  TNativeMenuProps,
  TNativeMenuSeparator,
} from './types';
