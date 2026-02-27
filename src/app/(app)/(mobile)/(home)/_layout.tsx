import { Stack } from 'expo-router';
import { FullLayout } from '@/components/layout/FullLayout';

function HomeScreen() {
  return (
    <FullLayout>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </FullLayout>
  );
};

export default HomeScreen;
