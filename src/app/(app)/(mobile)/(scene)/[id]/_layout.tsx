import { Stack } from 'expo-router';

export default function SceneIdLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="edit"
        options={{
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
