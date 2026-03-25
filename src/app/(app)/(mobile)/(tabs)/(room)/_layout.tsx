import type { ETheme } from '@/types/base';

import { Stack } from 'expo-router';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';

function RoomScreen() {
  const { theme } = useUniwind();
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          // Hide the native tab bar when viewing room detail
          // @ts-expect-error - tabBarHidden is supported by react-native-screens but not typed in expo-router
          tabBarHidden: true,
        }}
      />
    </Stack>
  );
};

export default RoomScreen;
