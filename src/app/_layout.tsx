import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { hydrateAuth, useAuthStore } from '@/features/auth/use-auth-store';

import { APIProvider } from '@/lib/api';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
// Import  global CSS file
import '../global.css';
import { hydrateUserStore } from '@/features/auth/user-store';
import { useCallback, useEffect, useState } from 'react';
import CustomSplashScreen from '@/features/splash-screen';
import { FullLayout } from '@/components/layout/FullLayout';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: '(app)',
};

const initApp = async () => {
  // Login and get access_token
  hydrateAuth();
  hydrateUserStore();
  // await ScreenOrientation.lockAsync(deviceType === DeviceType.TABLET ? ScreenOrientation.OrientationLock.LANDSCAPE : ScreenOrientation.OrientationLock.PORTRAIT);
  await SplashScreen.hideAsync();
  // Prevent the splash screen from auto-hiding before asset loading is complete.
  // Set the animation options. This is optional.
};

loadSelectedTheme();
initApp();


function RootRender() {
  const [isLoading, setIsLoading] = useState(true);

  const status = useAuthStore.use.status();

  const hideSplash = useCallback(async () => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (status !== 'idle') {
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


  return (
    <FullLayout>
      {
        isLoading ?
          <CustomSplashScreen />
          :
          <Stack screenOptions={{
            // 1. Ép nền của toàn bộ các màn hình trong Stack thành trong suốt
            contentStyle: { backgroundColor: 'transparent' },
          }}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen
              name="(welcome)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
      }
    </FullLayout>
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
