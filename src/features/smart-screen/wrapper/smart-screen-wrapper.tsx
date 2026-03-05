import { useCallback, useState } from 'react';
import { useUniwind } from 'uniwind';

import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ETabSmart } from '../types/types';
import { TabView, TabBarProps, SceneMap } from "react-native-tab-view";
import { Animated, useWindowDimensions } from "react-native";
import { translate } from '@/lib/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_SPACE_HORIZONTAL } from '@/constants';


const ROUTES = [
  { key: "tapToRun", title: translate("scene.tapToRun") },
  { key: "automation", title: translate("scene.automation") },
];

// --- MÀN HÌNH SCENE DÀNH CHO 2 TAB ---
const TapToRunScene = () => (
  <View className="flex-1 items-center justify-center bg-transparent">
    <Text className="text-gray-500">Nội dung Chạm để chạy</Text>
  </View>
);

const AutomationScene = () => (
  <View className="flex-1 items-center justify-center bg-transparent">
    <Text className="text-gray-500">Nội dung Tự động hóa</Text>
  </View>
);

export function SmartScreenWrapper({ className }: { className?: string }) {
  const { theme } = useUniwind();
  const [tabIndex, setTabIndex] = useState<ETabSmart>(ETabSmart.tapToRun)
  const layout = useWindowDimensions();

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "automation":
        return (
          <AutomationScene />
        );
      case "tapToRun":
        return (
          <TapToRunScene />)
    }
  };

  const renderTabBar = useCallback((props: TabBarProps<any>) => {
    const CONTAINER_WIDTH = WIDTH - BASE_SPACE_HORIZONTAL* 2;
    const INDICATOR_WIDTH = (CONTAINER_WIDTH - 4) / 2;
    const translateX = props.position.interpolate({
      inputRange: [0, 1],
      outputRange: [0, INDICATOR_WIDTH],
    });

    return (
      <View className="px-4 mt-4 mb-2">
        <View className="flex-row items-center relative w-full h-8.5 bg-gray-100 dark:bg-white/10 rounded-full p-0.5 shadow-sm">
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
                className="flex-1 h-full items-center justify-center z-10"
                onPress={() => props.jumpTo(route.key)}
              >
                <Text
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-white" // Đang active thì chữ trắng
                      : "text-gray-500 dark:text-gray-400" // Không active chữ xám
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
        onIndexChange={(index) => setTabIndex(index)}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width }}
        style={{ backgroundColor: "transparent" }}
        swipeEnabled={true}
      />
    </View>
  );
}