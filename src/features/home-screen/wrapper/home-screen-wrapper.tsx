import { LiveCameraWrapper } from "@/components/base/LiveCameraWrapper";
import { colors, Pressable, Text, View, WIDTH } from "@/components/ui";
import { ANIMATION_DURATION, ASPECT_RATIO_VIDEO, BASE_SPACE_HORIZONTAL } from "@/constants";
import { useConfigManager } from "@/stores/config/config";
import { useCallback, useMemo, useState } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, useAnimatedRef, useDerivedValue, scrollTo } from "react-native-reanimated";
import { SceneMap, TabBarProps, TabView } from 'react-native-tab-view';
import { TRouteType } from "../types/types";
import { useUniwind } from "uniwind";
import { ETheme } from "@/types/base";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MenuNative, TItemMenu } from "@/components/ui/menu-native";
import { NativeButton } from "@/components/ui/native-button";
import { LinearGradient } from "expo-linear-gradient";
import { useWindowDimensions } from "react-native";


const heightVideoOnScreen = ((WIDTH - BASE_SPACE_HORIZONTAL * 2) / ASPECT_RATIO_VIDEO)

export const HomeScreenWrapper = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const showCameraPreview = useConfigManager((state) => state.showCameraPreview);
  const animatedHeight = useSharedValue(heightVideoOnScreen)
  const { theme } = useUniwind()
  const layout = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const [routes] = useState([
    { key: 'favorite', title: 'Favorite' },
    { key: 'group1', title: 'Tầng 1' },
    { key: 'group2', title: 'Tầng 2' },
    { key: 'group3', title: 'Tầng 3' },
    { key: 'group4', title: 'Tầng 4' },
  ]);

  // Sử dụng useDerivedValue để theo dõi sự thay đổi của tabIndex một cách "phản xạ"
  useDerivedValue(() => {
    // Logic này sẽ chạy trực tiếp trên UI Thread mỗi khi tabIndex thay đổi
    if (tabIndex > 0) {
      // 80 là chiều rộng trung bình của 1 tab, bác có thể điều chỉnh
      // Chúng ta trừ 1 vì tab 0 (Favorite) nằm ngoài ScrollView
      scrollTo(scrollRef, (tabIndex - 1) * 80, 0, true);
    } else {
      // Nếu về lại Favorite, cuộn thanh scroll về đầu
      scrollTo(scrollRef, 0, 0, true);
    }
  });

  const renderScene = SceneMap({
    favorite: () => <View><Text>Yêu thích</Text></View>,
    group1: () => <View><Text>Tầng 1</Text></View>,
    group2: () => <View><Text>Tầng 2</Text></View>,
    group3: () => <View><Text>Tầng 3</Text></View>,
    group4: () => <View><Text>Tầng 4</Text></View>,
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(showCameraPreview ? heightVideoOnScreen : 0, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      }),
    };
  });

  const handleError = () => {
    animatedHeight.value = withTiming(animatedHeight.value > 0 ? 0 : heightVideoOnScreen, {
      duration: ANIMATION_DURATION
    })
  }

  const listItem: TItemMenu[] = useMemo(() => {
    return [
      {
        key: "managerScene",
        element: (
          <NativeButton
            onPress={() => {

            }}
          >
            abc
          </NativeButton>
        )
      }
    ]
  }, [])

  const renderTabBar = useCallback((props: TabBarProps<TRouteType>) => {
    const currentIndex = props.navigationState.index;
    const routes = props.navigationState.routes;

    return (
      <View className="w-full flex-row items-center gap-2 mb-2">
        {/* 1. PHẦN TĨNH: TAB FAVORITE */}
        <Pressable
          onPress={() => props.jumpTo('favorite')}
          className="rounded-full overflow-hidden"
        >
          <LinearGradient
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            colors={
              routes[currentIndex].key === 'favorite'
                ? (theme === ETheme.Light ? ['#141414', '#00000078'] : ['#FFFFFF', '#8D8D8D'])
                : ['#0000000D', '#0000000D']
            }
            style={{ paddingHorizontal: 16, paddingVertical: 6 }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: routes[currentIndex].key === 'favorite' ? "500" : "400",
                color: routes[currentIndex].key === 'favorite'
                  ? (theme === ETheme.Light ? "#FFFFFF" : "#1B1B1B")
                  : (theme === ETheme.Light ? "#737373" : "#8D8D8D")
              }}
            >
              Favorite
            </Text>
          </LinearGradient>
        </Pressable>

        {/* 2. PHẦN CUỘN: CÁC TẦNG CÒN LẠI */}
        <View className="flex-1">
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {routes.map((route, index) => {
              // Bỏ qua favorite vì đã render ở phần tĩnh
              if (route.key === 'favorite') return null;

              const focused = currentIndex === index;

              return (
                <Pressable
                  key={route.key}
                  onPress={() => props.jumpTo(route.key)}
                  className="rounded-full overflow-hidden"
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    colors={
                      focused
                        ? (theme === ETheme.Light ? ['#141414', '#00000078'] : ['#FFFFFF', '#8D8D8D'])
                        : ['#0000000D', '#0000000D']
                    }
                    style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: focused ? "500" : "400",
                        color: focused
                          ? (theme === ETheme.Light ? "#FFFFFF" : "#1B1B1B")
                          : (theme === ETheme.Light ? "#737373" : "#8D8D8D")
                      }}
                    >
                      {route.title}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </Animated.ScrollView>
        </View>

        {/* 3. MENU NATIVE */}
        <MenuNative
          triggerComponent={
            <View className="w-8 h-8 bg-black/5 dark:bg-white/10 rounded-full justify-center items-center">
              <MaterialIcons
                name="menu"
                size={16}
                color={theme === ETheme.Light ? "#737373" : "#FFFFFF"}
              />
            </View>
          }
          containerStyle={{ width: 32, height: 32 }}
          listItem={listItem}
        />
      </View>
    );
  }, [theme, listItem]); // Nhớ dependency

  return (
    <View className="w-full flex-1 px-4">
      <Animated.View style={[animatedStyle]} className="w-full mt-4 justify-center items-center overflow-hidden">
        {showCameraPreview && (
          <View className="h-full w-full flex-row justify-between">
            <LiveCameraWrapper
              videoUrl="rtsp://admin:EEVN1234%40@vanphongeec.ddns.net:1024/Streaming/channels/201"
              defaultImage=""
              handleError={handleError}
            />
          </View>)
        }
      </Animated.View>
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width }}
        style={{ backgroundColor: "transparent" }}
      />
    </View>
  );
};