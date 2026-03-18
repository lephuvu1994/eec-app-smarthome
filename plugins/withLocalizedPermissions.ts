// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import type { ConfigPlugin } from 'expo/config-plugins';

import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  withDangerousMod,
  withStringsXml,
} from 'expo/config-plugins';

// ══════════════════════════════════════════════════════════════
// Regex patterns (module scope for performance)
// ══════════════════════════════════════════════════════════════
const RE_AMP = /&/g;
const RE_LT = /</g;
const RE_GT = />/g;
const RE_DQUOTE = /"/g;
const RE_SQUOTE = /'/g;

function escapeXml(str: string): string {
  return str
    .replace(RE_AMP, '&amp;')
    .replace(RE_LT, '&lt;')
    .replace(RE_GT, '&gt;')
    .replace(RE_DQUOTE, '\\"')
    .replace(RE_SQUOTE, '\\\'');
}

// ══════════════════════════════════════════════════════════════
// Localized Permission Strings — iOS (InfoPlist.strings)
// ══════════════════════════════════════════════════════════════
const IOS_STRINGS: Record<string, Record<string, string>> = {
  en: {
    CFBundleDisplayName: 'SensaSpace',
    NSBluetoothAlwaysUsageDescription:
      'Allow SensaSpace to use Bluetooth to discover and connect to Smart Home devices.',
    NSCameraUsageDescription:
      'Allow SensaSpace to access your camera for QR code scanning.',
    NSMicrophoneUsageDescription:
      'Allow SensaSpace to use the microphone for voice control.',
    NSSiriUsageDescription:
      'Allow SensaSpace to use Siri for voice-controlled device management.',
    NSSpeechRecognitionUsageDescription:
      'Allow SensaSpace to use speech recognition for voice commands.',
    NSLocalNetworkUsageDescription:
      'Allow SensaSpace to discover devices on your local network.',
    NSPhotoLibraryUsageDescription:
      'Allow SensaSpace to access your photos for profile and home customization.',
  },
  vi: {
    CFBundleDisplayName: 'SensaSpace',
    NSBluetoothAlwaysUsageDescription:
      'Cho phép SensaSpace sử dụng Bluetooth để tìm kiếm và kết nối thiết bị Smart Home.',
    NSCameraUsageDescription:
      'Cho phép SensaSpace truy cập camera để quét mã QR thiết bị.',
    NSMicrophoneUsageDescription:
      'Cho phép SensaSpace sử dụng micro để điều khiển bằng giọng nói.',
    NSSiriUsageDescription:
      'Cho phép SensaSpace dùng Siri để điều khiển thiết bị bằng giọng nói.',
    NSSpeechRecognitionUsageDescription:
      'Cho phép SensaSpace nhận dạng giọng nói để điều khiển thiết bị.',
    NSLocalNetworkUsageDescription:
      'Cho phép SensaSpace tìm kiếm thiết bị trong mạng nội bộ.',
    NSPhotoLibraryUsageDescription:
      'Cho phép SensaSpace truy cập ảnh để tuỳ chỉnh hồ sơ và nhà.',
  },
};

// ══════════════════════════════════════════════════════════════
// Localized Permission Strings — Android (strings.xml)
// ══════════════════════════════════════════════════════════════
const ANDROID_STRINGS: Record<string, Record<string, string>> = {
  en: {
    app_name: 'SensaSpace',
    bluetooth_permission_rationale:
      'SensaSpace needs Bluetooth to discover and connect to Smart Home devices.',
    camera_permission_rationale:
      'SensaSpace needs camera access to scan QR codes.',
    microphone_permission_rationale:
      'SensaSpace needs microphone access for voice control.',
    location_permission_rationale:
      'SensaSpace needs location access to discover nearby devices.',
  },
  vi: {
    app_name: 'SensaSpace',
    bluetooth_permission_rationale:
      'SensaSpace cần Bluetooth để tìm kiếm và kết nối thiết bị Smart Home.',
    camera_permission_rationale:
      'SensaSpace cần truy cập camera để quét mã QR.',
    microphone_permission_rationale:
      'SensaSpace cần micro để điều khiển bằng giọng nói.',
    location_permission_rationale:
      'SensaSpace cần vị trí để tìm kiếm thiết bị gần đây.',
  },
};

// ══════════════════════════════════════════════════════════════
// iOS: Write InfoPlist.strings for each locale
// ══════════════════════════════════════════════════════════════
function generateInfoPlistStrings(
  strings: Record<string, string>,
): string {
  return Object.entries(strings)
    .map(([key, value]) => `"${key}" = "${value}";`)
    .join('\n');
}

const withLocalizedPermissionsIOS: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;
      const projectName
        = config.modRequest.projectName ?? config.name ?? 'SensaSpace';

      for (const [locale, strings] of Object.entries(IOS_STRINGS)) {
        const lprojDir = path.join(
          projectRoot,
          projectName,
          `${locale}.lproj`,
        );
        fs.mkdirSync(lprojDir, { recursive: true });

        const content = generateInfoPlistStrings(strings);
        fs.writeFileSync(
          path.join(lprojDir, 'InfoPlist.strings'),
          content,
          'utf-8',
        );
      }

      console.log(
        `✅ Localized InfoPlist.strings created for: ${Object.keys(IOS_STRINGS).join(', ')}`,
      );
      return config;
    },
  ]);
};

// ══════════════════════════════════════════════════════════════
// Android: Write strings.xml for each locale
// ══════════════════════════════════════════════════════════════
const withLocalizedPermissionsAndroid: ConfigPlugin = (config) => {
  // Default (en) strings via withStringsXml
  config = withStringsXml(config, (config) => {
    const strings = ANDROID_STRINGS.en;
    for (const [name, value] of Object.entries(strings)) {
      // Remove existing entry if present
      config.modResults.resources.string = (
        config.modResults.resources.string ?? []
      ).filter((s: any) => s.$.name !== name);

      config.modResults.resources.string.push({
        $: { name },
        _: value,
      });
    }
    return config;
  });

  // Localized strings via withDangerousMod
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
      );

      for (const [locale, strings] of Object.entries(ANDROID_STRINGS)) {
        if (locale === 'en') {
          continue; // Default already handled
        }

        const valuesDir = path.join(resDir, `values-${locale}`);
        fs.mkdirSync(valuesDir, { recursive: true });

        const xml = [
          '<?xml version="1.0" encoding="utf-8"?>',
          '<resources>',
          ...Object.entries(strings).map(
            ([name, value]) =>
              `    <string name="${name}">${escapeXml(value)}</string>`,
          ),
          '</resources>',
        ].join('\n');

        fs.writeFileSync(
          path.join(valuesDir, 'strings.xml'),
          xml,
          'utf-8',
        );
      }

      console.log(
        `✅ Localized strings.xml created for: ${Object.keys(ANDROID_STRINGS).join(', ')}`,
      );
      return config;
    },
  ]);

  return config;
};

// ══════════════════════════════════════════════════════════════
// Combined Plugin
// ══════════════════════════════════════════════════════════════
const withLocalizedPermissions: ConfigPlugin = (config) => {
  config = withLocalizedPermissionsIOS(config);
  config = withLocalizedPermissionsAndroid(config);
  return config;
};

export default withLocalizedPermissions;
