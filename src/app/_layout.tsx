import type { ETheme } from '@/types/base';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useVoiceControl } from '@/hooks/use-voice-control';
import { APIProvider } from '@/lib/api';
import { deviceService } from '@/lib/api/devices/device.service';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
import { useDeviceStore } from '@/stores/device/device-store';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';
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

  useVoiceControl();

  const hideSplash = useCallback(async () => {
    setIsLoading(false);
  }, []);

  // Boot hydration: chỉ chạy 1 lần duy nhất mỗi session (tránh StrictMode double-invoke)
  const hasBootHydratedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let fallbackTimer: any;

    const performBootHydration = async () => {
      if (status === EAuthStatus.signIn) {
        if (!hasBootHydratedRef.current) {
          hasBootHydratedRef.current = true;
          try {
            const homeId = useHomeStore.getState().selectedHomeId;
            if (homeId) {
              // Khởi chạy 2 API ngầm (Home Structure & Devices)
              const syncPromise = Promise.allSettled([
                useHomeDataStore.getState().syncFromAPI(homeId),
                deviceService.getDevices({ homeId, limit: 50 }).then((res: any) =>
                  useDeviceStore.getState().setDevices(res.data),
                ),
              ]);

              // Race Condition: Tối đa cho cục API fetch là 2000ms. Dù xong hay không cũng thả qua màn hình Home.
              const timeoutPromise = new Promise((resolve) => {
                fallbackTimer = setTimeout(resolve, 2000);
              });
              await Promise.race([syncPromise, timeoutPromise]);
              clearTimeout(fallbackTimer);
            }
            else {
              // Đăng nhập nhưng chưa có Nhà nào được lưu cache -> Chờ 500ms cho mượt
              await new Promise((resolve) => {
                fallbackTimer = setTimeout(resolve, 500);
              });
            }
          }
          catch {
            // Bỏ qua lỗi mạng hỏng, nhả Splash Screen cho MMKV Render offline
          }
        }
      }
      else {
        // Sign Out hoặc Auth fail -> Chờ 500ms cho mượt hoạt ảnh
        hasBootHydratedRef.current = false; // Reset để re-login sẽ hydrate lại
        await new Promise((resolve) => {
          fallbackTimer = setTimeout(resolve, 500);
        });
      }

      if (isMounted) {
        await hideSplash();
      }
    };

    if (status !== EAuthStatus.idle) {
      void performBootHydration();
    }

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      // Dọn dẹp phòng hờ khi unmount đột ngột
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
