#!/usr/bin/env node
/**
 * Tạm thời sửa plugin react-native-vlc-media-player cho Expo prebuild (Expo/RN 0.81+).
 * Đổi anchor từ applyNativeModulesAppBuildGradle(project) sang autolinkLibrariesWithApp().
 * Chạy trước mỗi lần prebuild để không phụ thuộc patch-package.
 */
const fs = require('node:fs');
const path = require('node:path');

// Trong file có 1 ký tự backslash thật trước ( và ). Trong string literal \\ = 1 backslash.
const OLD_LINE = 'anchor: /applyNativeModulesAppBuildGradle\\(project\\)/i,';
const NEW_LINE = '// Expo/RN 0.81+ use autolinkLibrariesWithApp() instead of applyNativeModulesAppBuildGradle(project)\n            anchor: /autolinkLibrariesWithApp\\(\\)/i,';

function patchFile(filePath) {
  if (!fs.existsSync(filePath))
    return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('applyNativeModulesAppBuildGradle'))
    return false;
  if (content.includes('autolinkLibrariesWithApp()'))
    return false; // already patched
  if (!content.includes(OLD_LINE))
    return false;
  content = content.replace(OLD_LINE, NEW_LINE);
  fs.writeFileSync(filePath, content);
  return true;
}

const primaryPath = path.join(
  process.cwd(),
  'node_modules',
  'react-native-vlc-media-player',
  'expo',
  'android',
  'withGradleTasks.js',
);

let patched = patchFile(primaryPath);

try {
  const resolvePath = require.resolve(
    'react-native-vlc-media-player/expo/android/withGradleTasks.js',
    {
      paths: [process.cwd()],
    },
  );
  if (resolvePath && resolvePath !== primaryPath) {
    patched = patchFile(resolvePath) || patched;
  }
}
catch {
  // ignore
}

if (patched) {
  console.log(
    'patch-vlc-for-prebuild: applied (anchor → autolinkLibrariesWithApp).',
  );
}
else {
  console.log(
    'patch-vlc-for-prebuild: already patched or package not found, skip.',
  );
}
process.exit(0);
