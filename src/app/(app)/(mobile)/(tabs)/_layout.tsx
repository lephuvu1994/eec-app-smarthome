import { Tabs } from 'expo-router';

import { CustomTabBar } from '@/features/TabBar/TabBar';

function MobileLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(smart)" />
      <Tabs.Screen name="(settings)" />
    </Tabs>
  );
}

export default MobileLayout;
