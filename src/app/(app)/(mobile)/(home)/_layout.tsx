import type { ETheme } from '@/types/base';
import { Stack } from 'expo-router';
import { useUniwind } from 'uniwind';
import { colors } from '@/components/ui';

function HomeScreen() {
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
    </Stack>
  );
};

export default HomeScreen;
