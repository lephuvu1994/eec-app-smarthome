import type { ConfigContext, ExpoConfig } from '@expo/config';

import type { AppIconBadgeConfig } from 'app-icon-badge/types';

import 'tsx/cjs';

// adding lint exception as we need to import tsx/cjs before env.ts is imported
// eslint-disable-next-line perfectionist/sort-imports
import Env from './env';

const EXPO_ACCOUNT_OWNER = 'vule94';
const EAS_PROJECT_ID = '75ae721d-f4db-4468-ad91-e5e77831ec57';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.EXPO_PUBLIC_NAME,
  description: `${Env.EXPO_PUBLIC_NAME} Mobile App`,
  owner: EXPO_ACCOUNT_OWNER,
  scheme: Env.EXPO_PUBLIC_SCHEME,
  slug: 'sensa-smart',
  version: Env.EXPO_PUBLIC_VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/logo.png',
  userInterfaceStyle: 'automatic',
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  splash: {
    image: './assets/splash-screen/splash-screen.png',
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
    dark: {
      backgroundColor: '#FFFFFF',
      image: './assets/splash-screen/splash-screen.png',
    },
  },
  ios: {
    supportsTablet: true,
    requireFullScreen: true,
    bundleIdentifier: Env.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ['audio'],
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      NSSiriUsageDescription: 'App cần quyền Siri để điều khiển thiết bị bằng giọng nói.',
    },
    entitlements: {
      'com.apple.developer.siri': true,
    },
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/logo.png',
      backgroundColor: '#2E3C4B',
    },
    permissions: ['WAKE_LOCK', 'RECORD_AUDIO'],
    package: Env.EXPO_PUBLIC_PACKAGE,
    intentFilters: [
      {
        action: 'VIEW',
        data: {
          scheme: 'my-smarthome-app',
          host: 'control',
        },
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'react-native-ble-manager',
      {
        isBLERequired: true,
        neverForLocation: true,
        bluetoothAlwaysPermission:
          'Cho phép ứng dụng sử dụng Bluetooth để tìm kiếm và kết nối với các thiết bị Smart Home.',
      },
    ],
    [
      'expo-font',
      {
        ios: {
          fonts: [
            'node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf',
            'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf',
            'node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf',
            'node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf',
          ],
        },
        android: {
          fonts: [
            {
              fontFamily: 'Inter',
              fontDefinitions: [
                {
                  path: 'node_modules/@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf',
                  weight: 400,
                },
                {
                  path: 'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf',
                  weight: 500,
                },
                {
                  path: 'node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf',
                  weight: 600,
                },
                {
                  path: 'node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf',
                  weight: 700,
                },
              ],
            },
          ],
        },
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-localization',
    './plugins/withLocalizedPermissions',
    'expo-router',
    [
      'expo-screen-orientation',
      {
        initialOrientation: 'PORTRAIT',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'The app accesses your photos to let you share them with your friends.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
        microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
        recordAudioAndroid: true,
      },
    ],
    [
      'react-native-vlc-media-player',
      {
        ios: {
          includeVLCKit: false,
        },
        android: {
          legacyJetifier: false,
        },
      },
    ],
    ['react-native-edge-to-edge'],
    'expo-image',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true,
          reactNativeReleaseLevel: 'experimental',
          hermesVersion: '1',
        },
        ios: {
          reactNativeReleaseLevel: 'experimental',
          hermesVersion: '1',
        },
      },
    ],
    [
      'expo-document-picker',
      {
        iCloudContainerEnvironment: 'Production',
      },
    ],
    [
      'expo-speech-recognition',
      {
        microphonePermission: 'Allow $(PRODUCT_NAME) to use the microphone.',
        speechRecognitionPermission:
          'Allow $(PRODUCT_NAME) to use speech recognition.',
        androidSpeechServicePackages: [
          'com.google.android.googlequicksearchbox',
        ],
      },
    ],
  ],
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
});
