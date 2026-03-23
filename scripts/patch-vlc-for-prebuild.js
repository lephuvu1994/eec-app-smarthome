#!/usr/bin/env node
/* eslint-disable e18e/prefer-static-regex */
/**
 * Tạm thời sửa plugin react-native-vlc-media-player cho Expo prebuild (Expo/RN 0.81+).
 *
 * Patch 1: Đổi anchor từ applyNativeModulesAppBuildGradle(project) sang autolinkLibrariesWithApp().
 * Patch 2: Fix null safety cho .toPath() — RN 0.83+ không còn jetified-react-android directory.
 *
 * Chạy tự động qua postinstall để không phụ thuộc patch-package.
 */
const fs = require('node:fs');
const path = require('node:path');

function patchFile(filePath) {
  if (!fs.existsSync(filePath))
    return [];
  let content = fs.readFileSync(filePath, 'utf8');
  const applied = [];

  // ─── Patch 1: Anchor (applyNativeModulesAppBuildGradle → autolinkLibrariesWithApp) ───
  // File chứa regex literal: /applyNativeModulesAppBuildGradle\(project\)/i
  // Khi đọc bằng readFileSync, string chứa ký tự `\(` (1 backslash + paren)
  if (content.includes('applyNativeModulesAppBuildGradle')) {
    content = content.replace(
      /anchor:\s*\/applyNativeModulesAppBuildGradle\\\(project\\\)\/i/g,
      'anchor: /autolinkLibrariesWithApp\\(\\)/i',
    );
    applied.push('anchor');
  }

  // ─── Patch 2: Null safety (.orElse(null).toPath() → null check) ───
  if (content.includes('java.nio.file.Path notNeededDirectory = it.externalLibNativeLibs')) {
    content = content.replace(
      'java.nio.file.Path notNeededDirectory = it.externalLibNativeLibs',
      'def foundFile = it.externalLibNativeLibs',
    );
    content = content.replace(
      `.orElse(null)
                            .toPath();
                    java.nio.file.Files.walk(notNeededDirectory).forEach(file -> {
                        if (file.toString().contains("libc++_shared.so")) {
                            java.nio.file.Files.delete(file);
                        }
                    });`,
      `.orElse(null);
                    if (foundFile != null) {
                        java.nio.file.Path notNeededDirectory = foundFile.toPath();
                        java.nio.file.Files.walk(notNeededDirectory).forEach(file -> {
                            if (file.toString().contains("libc++_shared.so")) {
                                java.nio.file.Files.delete(file);
                            }
                        });
                    }`,
    );
    applied.push('null-safety');
  }

  if (applied.length > 0) {
    fs.writeFileSync(filePath, content);
  }
  return applied;
}

const primaryPath = path.join(
  process.cwd(),
  'node_modules',
  'react-native-vlc-media-player',
  'expo',
  'android',
  'withGradleTasks.js',
);

let allPatches = patchFile(primaryPath);

try {
  const resolvePath = require.resolve(
    'react-native-vlc-media-player/expo/android/withGradleTasks.js',
    {
      paths: [process.cwd()],
    },
  );
  if (resolvePath && resolvePath !== primaryPath) {
    const extra = patchFile(resolvePath);
    allPatches = [...new Set([...allPatches, ...extra])];
  }
}
catch {
  // ignore
}

if (allPatches.length > 0) {
  console.log(
    `patch-vlc-for-prebuild: applied [${allPatches.join(', ')}].`,
  );
}
else {
  console.log(
    'patch-vlc-for-prebuild: already patched or package not found, skip.',
  );
}
process.exit(0);
