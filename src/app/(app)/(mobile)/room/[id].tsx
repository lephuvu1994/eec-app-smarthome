import { Stack } from 'expo-router';

import { RoomDashboardScreen } from '@/features/room/room-dashboard-screen';

export default function RoomDetailRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'slide_from_right' }} />
      <RoomDashboardScreen />
    </>
  );
}
