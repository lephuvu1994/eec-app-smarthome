// This file exists only to satisfy TypeScript module resolution.
// At runtime, Metro will use native-menu.ios.tsx or native-menu.android.tsx.
// We re-export the iOS implementation as the default for type checking.
export { NativeMenu } from './native-menu.ios';
