import type { ETheme } from '@/types/base';

import { Stack } from 'expo-router';
import { useUniwind } from 'uniwind';

import { colors } from '@/components/ui';

function RoomLayout() {
  const { theme } = useUniwind();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.screenBackground[theme as ETheme] },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

export default RoomLayout;
