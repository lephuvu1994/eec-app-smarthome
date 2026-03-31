/* eslint-disable ts/ban-ts-comment */
/* eslint-disable no-restricted-globals */

// Mock react-native-worklets first
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: any) => React.createElement(View, null, children),
    SafeAreaView: ({ children }: any) => React.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
    SafeAreaInsetsContext: { Consumer: ({ children }: any) => children({ top: 0, right: 0, bottom: 0, left: 0 }) },
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;

  const createLayoutAnim = () => {
    const anim: any = {};
    anim.delay = jest.fn(() => anim);
    anim.duration = jest.fn(() => anim);
    anim.withInitialValues = jest.fn(() => anim);
    return anim;
  };

  const fadeIn = createLayoutAnim();
  const fadeOut = createLayoutAnim();
  const fadeInDown = createLayoutAnim();
  const fadeInUp = createLayoutAnim();
  const fadeInLeft = createLayoutAnim();
  const fadeInRight = createLayoutAnim();
  const slideInDown = createLayoutAnim();
  const slideInUp = createLayoutAnim();
  const slideInLeft = createLayoutAnim();
  const slideInRight = createLayoutAnim();

  return {
    __esModule: true,
    default: {
      View,
      ScrollView: View,
      createAnimatedComponent: (component: any) => component,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(fn => fn()),
    useAnimatedProps: jest.fn(fn => fn()),
    withTiming: jest.fn(value => value),
    withSpring: jest.fn(value => value),
    withDecay: jest.fn(value => value),
    withDelay: jest.fn((_, value) => value),
    withRepeat: jest.fn(value => value),
    withSequence: jest.fn((...values) => values[0]),
    cancelAnimation: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(fn => fn),
      out: jest.fn(fn => fn),
      inOut: jest.fn(fn => fn),
    },
    interpolate: jest.fn((_value, _inputRange, outputRange) => outputRange[0]),
    interpolateColor: jest.fn(() => '#ffffff'),
    FadeIn: fadeIn,
    FadeOut: fadeOut,
    FadeInDown: fadeInDown,
    FadeInUp: fadeInUp,
    FadeInLeft: fadeInLeft,
    FadeInRight: fadeInRight,
    SlideInDown: slideInDown,
    SlideInUp: slideInUp,
    SlideInLeft: slideInLeft,
    SlideInRight: slideInRight,
    Layout: {},
    Keyframe: jest.fn(),
  };
});

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [
    {
      languageTag: 'en-US',
      languageCode: 'en',
      textDirection: 'ltr',
      digitGroupingSeparator: ',',
      decimalSeparator: '.',
      measurementSystem: 'metric',
      currencyCode: 'USD',
      currencySymbol: '$',
      regionCode: 'US',
    },
  ]),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
  useMMKVString: jest.fn((_key: string) => [undefined, jest.fn()]),
  useMMKVNumber: jest.fn((_key: string) => [undefined, jest.fn()]),
  useMMKVBoolean: jest.fn((_key: string) => [undefined, jest.fn()]),
  useMMKVObject: jest.fn((_key: string) => [undefined, jest.fn()]),
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

// Global window object setup for React Native testing
// @ts-expect-error
global.window = {};

// @ts-expect-error
global.window = global;

// Bypass axios fetch feature detection that crashes with Expo streams
const originalResponse = global.Response;
const originalReadableStream = global.ReadableStream;
// @ts-expect-error
delete global.Response;
// @ts-expect-error
delete global.window.Response;
// @ts-expect-error
delete global.ReadableStream;
// @ts-expect-error
delete global.window.ReadableStream;

const axios = require('axios');

global.Response = originalResponse;
global.window.Response = originalResponse;
global.ReadableStream = originalReadableStream;
global.window.ReadableStream = originalReadableStream;

axios.defaults.adapter = ['http'];
// Mock axios globally to avoid "fetch adapter" requirement issues in JSDOM
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
}));

// Mock the common API client
jest.mock('@/lib/api/common', () => ({
  client: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));
