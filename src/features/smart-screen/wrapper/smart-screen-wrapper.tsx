import type { TabBarProps } from 'react-native-tab-view';
import { LinearGradient } from 'expo-linear-gradient';

import { useCallback, useState } from 'react';
import { Animated, useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ETabSmart } from '../types/types';

const ROUTES = [
  { key: 'tapToRun', title: translate('scene.tapToRun') },
  { key: 'automation', title: translate('scene.automation') },
];

// --- MÀN HÌNH SCENE DÀNH CHO 2 TAB ---
function TapToRunScene() {
  return (
    <View className="flex-1 items-center justify-center bg-transparent">
      <Text className="text-gray-500">Nội dung Chạm để chạy</Text>
    </View>
  );
}

function AutomationScene() {
  return (
    <View className="flex-1 items-center justify-center bg-transparent">
      <Text className="text-gray-500">Nội dung Tự động hóa</Text>
    </View>
  );
}

export function SmartScreenWrapper({ className }: { className?: string }) {
  const [tabIndex, setTabIndex] = useState<ETabSmart>(ETabSmart.tapToRun);
  const layout = useWindowDimensions();

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'automation':
        return (
          <AutomationScene />
        );
      case 'tapToRun':
        return (
          <TapToRunScene />);
    }
  };

  const renderTabBar = useCallback((props: TabBarProps<any>) => {
    const CONTAINER_WIDTH = WIDTH - BASE_SPACE_HORIZONTAL * 2;
    const INDICATOR_WIDTH = (CONTAINER_WIDTH - 4) / 2;
    const translateX = props.position.interpolate({
      inputRange: [0, 1],
      outputRange: [0, INDICATOR_WIDTH],
    });

    return (
      <View className="mt-4 mb-2 px-4">
        <View className="relative h-8.5 w-full flex-row items-center rounded-full bg-gray-100 p-0.5 shadow-sm dark:bg-white/10">
          <Animated.View
            style={{
              position: 'absolute',
              width: INDICATOR_WIDTH,
              height: 30,
              top: 2,
              left: 2,
              borderRadius: 999,
              transform: [{ translateX }],
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#141414', 'rgba(0, 0, 0, 0.60)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{ flex: 1 }}
            />
          </Animated.View>

          {props.navigationState.routes.map((route, i) => {
            const isActive = tabIndex === i;

            return (
              <Pressable
                key={route.key}
                className="z-10 h-full flex-1 items-center justify-center"
                onPress={() => props.jumpTo(route.key)}
              >
                <Text
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white' // Đang active thì chữ trắng
                      : 'text-gray-500 dark:text-gray-400', // Không active chữ xám
                  )}
                >
                  {route.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }, [tabIndex, layout.width]);

  return (
    <View className={cn('flex-1 gap-2', className)}>
      <TabView
        navigationState={{ index: tabIndex, routes: ROUTES }}
        renderScene={renderScene}
        onIndexChange={index => setTabIndex(index)}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width }}
        style={{ backgroundColor: 'transparent' }}
        swipeEnabled={true}
      />
    </View>
  );
}
