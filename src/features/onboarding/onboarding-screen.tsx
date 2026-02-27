import type { FlashListRef } from '@shopify/flash-list';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';

import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { twMerge } from 'tailwind-merge';
import { colors, List, WIDTH } from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';

/**
 * DESIGN COLORS
 */

const COLORS = {
  // nền chính gần với màu viền ngoài cùng trong mock
  background: '#1e2021',
  textDim: '#9AA0A6',
  neon: '#A3E635',
};

const DATA = [
  {
    id: '1',
    title: 'Hỗ trợ thiết bị khác nhau',
    description:
      'Kết nối các thiết bị yêu thích trong một hệ sinh thái',
    image:
      require('@@/assets/onboarding/connected-device-onboarding.png'),
  },
  {
    id: '2',
    title: 'Tự tạo kịch bản',
    description:
      'Thiết lập tự động hóa cho các công việc hàng ngày',
    image:
      require('@@/assets/onboarding/smarthome-connect-home.png'),
  },
  {
    id: '3',
    title: 'Chia sẻ gia đình',
    description:
      'Cùng nhau quản lý thiết bị với các thành viên',
    image:
      require('@@/assets/onboarding/onboarding-step3.png'),
  },
  {
    id: '4',
    title: 'Lưu trữ camera',
    description:
      'Xem lại lịch sử camera mọi lúc mọi nơi',
    image:
      require('@@/assets/onboarding/camera-onboarding.png'),
  },
];

export function OnboardingScreen() {
  const [_, setFirstTime] = useIsFirstTime();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  const listRef = useRef<FlashListRef<typeof DATA[number]>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0)
      setIndex(viewableItems[0].index);
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const next = () => {
    if (index < DATA.length - 1) {
      listRef.current?.scrollToIndex({
        index: index + 1,
      });
    }
    else {
      setFirstTime(false);
    }
  };

  const renderItem = ({ item }: any) => {
    return (
      <View className="w-full items-center py-8" style={{ width: WIDTH }}>
        <View className="w-full items-center gap-4">
          <View className="items-center justify-between gap-4 py-10" style={{ width: WIDTH - 16, aspectRatio: '1/1' }}>
            <Image source={item.image} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
          </View>
          <View className="h-56 w-full items-center justify-between gap-4">
            <View className="gap-4 px-6">
              <Text className="text-center text-3xl font-bold text-white">
                {item.title}
              </Text>

              <Text className="text-center text-base text-white">
                {item.description}
              </Text>
            </View>
            {/* BUTTON */}

            <View className="w-full px-4 pb-4">
              <TouchableOpacity
                activeOpacity={0.9}
                className={twMerge('h-10 items-center justify-center rounded-full border')}
                style={{ borderWidth: 1, borderColor: COLORS.neon, backgroundColor: index === DATA.length - 1 ? COLORS.neon : 'transparent' }}
                onPress={next}
              >
                <Text className="text-sm font-medium" style={{ color: index === DATA.length - 1 ? colors.black : COLORS.neon }}>
                  {index === DATA.length - 1 ? 'BẮT ĐẦU' : 'TIẾP THEO'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={['#131c27', COLORS.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar barStyle="light-content" />
      <View className="h-full gap-2" style={{ paddingTop: insets.top }}>
        {/* HEADER */}
        <View className="px-4">
          <View className="flex-row items-center justify-between gap-2 pt-4">
            <View className="flex-1 flex-row gap-1.5">
              {DATA.map((_, i) => (
                <View
                  key={_.id}
                  style={{ backgroundColor: i <= index ? 'white' : 'rgba(255,255,255,0.2)', height: 2, width: ((WIDTH / DATA.length) - ((DATA.length - 1) * 6) - 4), borderRadius: 10 }}
                />
              ))}

            </View>

            <TouchableOpacity
              onPress={() => setFirstTime(false)}
              className=""
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>

          </View>
        </View>

        {/* LIST */}

        <View className="flex-1">
          <List
            ref={listRef}
            data={DATA}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={i => i.id}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>

  );
}
