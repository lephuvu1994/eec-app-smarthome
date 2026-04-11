import { Stack } from 'expo-router';

export default function SceneLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'fullScreenModal' }}>
      <Stack.Screen
        name="hub"
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="builder"
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="device-selector"
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="tap-to-run-builder"
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
