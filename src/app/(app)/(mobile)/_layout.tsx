import { Stack } from 'expo-router';

export default function MobileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-device" />
    </Stack>
  );
}
