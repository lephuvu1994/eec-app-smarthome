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
        name="[roomId]"
        options={{
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="floorManager"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="roomManager"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="favoriteRoomManager"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="addFavoriteRoom"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default RoomScreen;
