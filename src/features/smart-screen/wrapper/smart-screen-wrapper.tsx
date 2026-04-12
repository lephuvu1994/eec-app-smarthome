import type { TabBarProps } from 'react-native-tab-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';

import { Animated as RNAnimated, useWindowDimensions } from 'react-native';

import { TabView } from 'react-native-tab-view';
import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ETabSmart, ETabSmartKey } from '../types/types';
import { SceneListWrapper } from './scene-list-wrapper';

const ROUTES = [
  { key: ETabSmartKey.tapToRun, title: translate('scene.tapToRun') },
  { key: ETabSmartKey.automation, title: translate('scene.automation') },
];

export function SmartScreenWrapper({ className }: { className?: string }) {
  const [tabIndex, setTabIndex] = useState<ETabSmart>(ETabSmart.tapToRun);
  const layout = useWindowDimensions();

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case ETabSmartKey.automation:
        return (
          <SceneListWrapper type="automation" className="pt-2" />
        );
      case ETabSmartKey.tapToRun:
        return (
          <SceneListWrapper type="tapToRun" className="pt-2" />);
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
      <View className="px-4">
        <View className="relative h-8.5 w-full flex-row items-center rounded-full bg-gray-100 p-0.5 shadow-sm dark:bg-white/10">
          <RNAnimated.View
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
          </RNAnimated.View>

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
