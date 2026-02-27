import { Stack } from 'expo-router';
import { FullLayout } from '@/components/layout/FullLayout';

function RoomScreen() {
  return (
    <FullLayout>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
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
    </FullLayout>
  );
};

export default RoomScreen;
