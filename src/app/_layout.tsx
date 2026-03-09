import type { ETheme } from '@/types/base';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useUniwind } from 'uniwind';
import { colors } from '@/components/ui';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { EAuthStatus } from '@/features/auth/types/enum';
import { hydrateAuth, useUserManager } from '@/features/auth/user-store';
import CustomSplashScreen from '@/features/splash-screen';
import { APIProvider } from '@/lib/api';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
// Import  global CSS file
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: '(app)',
};

async function initApp() {
  // Login and get access_token
  await hydrateAuth();
  // await ScreenOrientation.lockAsync(deviceType === DeviceType.TABLET ? ScreenOrientation.OrientationLock.LANDSCAPE : ScreenOrientation.OrientationLock.PORTRAIT);
  await SplashScreen.hideAsync();
  // Prevent the splash screen from auto-hiding before asset loading is complete.
  // Set the animation options. This is optional.
}

loadSelectedTheme();
initApp();

function RootRender() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useUniwind();
  const { status } = useUserManager();

  // useVoiceControl();

  const hideSplash = useCallback(async () => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (status !== EAuthStatus.idle) {
      timer = setTimeout(async () => {
        await hideSplash();
      }, 1500);
    }
    return () => {
      clearTimeout(timer);
      // Chỉ ẩn splash khi đã từng set timer (đã vào màn hình chính), tránh ẩn sớm khi redirect login/onboarding (idle → signOut)
      if (timer !== undefined)
        void hideSplash();
    };
  }, [status, hideSplash]);

  return isLoading
    ? <CustomSplashScreen />
    : (
        <Stack screenOptions={{
          contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
        }}
        >
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen
            name="(welcome)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      );
}

export default function RootLayout() {
  return (
    <Providers>
      <RootRender />
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
