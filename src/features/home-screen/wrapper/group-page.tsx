import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ETheme } from '@/types/base';

const ROOMS_DATA: Record<string, { id: string; title: string }[]> = {
  favorite: [{ id: 'fav1', title: 'Thiết bị thường dùng' }],
  t1: [
    { id: 'r1', title: 'Phòng khách' },
    { id: 'r2', title: 'Phòng bếp' },
    { id: 'r3', title: 'Sân vườn' },
  ],
  t2: [
    { id: 'r4', title: 'Ngủ Master' },
    { id: 'r5', title: 'Phòng làm việc' },
  ],
  t3: [
    { id: 'r6', title: 'Phòng thờ' },
    { id: 'r7', title: 'Sân thượng' },
  ],
};

// ==========================================
// 1. FLOOR PAGE COMPONENT (Lớp trong)
// Quản lý việc cuộn ngang giữa các phòng trong một tầng
// ==========================================
export const GroupPage = memo(({ group, theme }: { group: any; theme: ETheme }) => {
  const isFav = group.key === 'favorite';
  const rooms = ROOMS_DATA[group.key] || [];
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);

  const secondaryTabRef = useRef<ScrollView>(null);
  const innerScrollRef = useRef<ScrollView>(null);
  const isManualRoomScrolling = useRef(false);

  // Xử lý đồng bộ từ Vuốt nội dung sang Tab Phòng
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isManualRoomScrolling.current)
      return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / WIDTH);

    if (index >= 0 && index < rooms.length && index !== activeRoomIdx) {
      setActiveRoomIdx(index);
      secondaryTabRef.current?.scrollTo({ x: index * 80, animated: true });
    }
  }, [rooms.length, activeRoomIdx]);

  // Xử lý điều hướng khi nhấn Tab Phòng
  const jumpToRoom = useCallback((idx: number) => {
    if (idx !== activeRoomIdx) {
      isManualRoomScrolling.current = true;
      setActiveRoomIdx(idx);
      innerScrollRef.current?.scrollTo({ x: idx * WIDTH, animated: true });
      secondaryTabRef.current?.scrollTo({ x: idx * 80, animated: true });
      setTimeout(() => isManualRoomScrolling.current = false, 400);
    }
  }, [activeRoomIdx]);

  return (
    <View style={{ width: WIDTH, flex: 1 }}>
      {/* THANH TAB PHỤ (SECONDARY TAB) */}
      {!isFav && (
        <View className="mb-4 px-4">
          <ScrollView
            ref={secondaryTabRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {rooms.map((room, idx) => {
              const focused = activeRoomIdx === idx;
              return (
                <Pressable
                  key={room.id}
                  onPress={() => jumpToRoom(idx)}
                  className="overflow-hidden rounded-full"
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    colors={
                      focused
                        ? (theme === ETheme.Light ? ['#141414', '#00000078'] : ['#FFFFFF', '#8D8D8D'])
                        : ['#0000000D', '#0000000D']
                    }
                    style={{ paddingHorizontal: 16, paddingVertical: 2 }}
                  >
                    <Text className={cn(
                      'text-sm font-normal',
                      focused && 'font-bold',
                      focused ? 'text-white dark:text-black' : 'text-black dark:text-white',
                    )}
                    >
                      {room.title}
                    </Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* DANH SÁCH PHÒNG (INNER CONTENT) */}
      <View className="flex-1">
        <ScrollView
          ref={innerScrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          overScrollMode="never"
        >
          {rooms.map(item => (
            <View key={item.id} style={{ width: WIDTH }} className="px-4 pb-4">
              <ScrollView
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                className="flex-1 overflow-hidden rounded-[32px] bg-black/5 dark:bg-white/10"
              >
                <View className="items-center p-6">
                  <MaterialIcons
                    name={isFav ? 'star' : 'door-front'}
                    size={40}
                    color={isFav ? '#F59E0B' : (theme === ETheme.Light ? '#737373' : '#FFF')}
                  />
                  <Text className="mt-2 text-xl font-bold dark:text-white">{item.title}</Text>
                </View>

                {/* Danh sách thiết bị mẫu */}
                <View className="gap-3 px-4 pb-6">
                  {[1, 2, 3, 4, 5, 6].map(device => (
                    <View key={device} className="h-20 flex-row items-center rounded-2xl bg-white px-4 shadow-sm dark:bg-black/20">
                      <View className="mr-4 size-10 rounded-full bg-[#A3E635]" />
                      <View>
                        <Text className="text-base font-bold dark:text-white">
                          Thiết bị
                          {device}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});
