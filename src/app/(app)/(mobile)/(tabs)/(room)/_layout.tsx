import type { ETheme } from '@/types/base';

import { Stack } from 'expo-router';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';

function RoomScreen() {
  const { theme } = useUniwind();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          // Use 'fade' animation to allow Reanimated shared element to control the visual transition
          animation: 'fade',
        }}
      />
    </Stack>
  );
};

export default RoomScreen;
