import React, { useState, useRef, useEffect } from "react";
import { useWindowDimensions, StyleSheet } from "react-native";
import { View, Text, TouchableOpacity, } from "@/components/ui";
import { Image } from "expo-image";
import * as Haptics from 'expo-haptics'; // Import Haptics
import { EDeviceConnectStatus, ETypeViewDevice, TDevice } from "@/types/device";
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE, GRID_VIEW_DEVICE_MOBILE } from "@/constants";
import { PowerIcon } from "@/components/ui/icons/power-icon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  withSpring,
  interpolate,
  Extrapolation
} from "react-native-reanimated";
import { useConfigManager } from "@/stores/config/config";
import { LinearGradient } from "expo-linear-gradient";

type TProps = {
  device: TDevice;
  typeViewDevice: ETypeViewDevice;
};

export const DeviceItem: React.FC<TProps> = ({ device, typeViewDevice }) => {
  const layout = useWindowDimensions();
  const { allowHaptics } = useConfigManager();
  // 1. State đồng bộ từ Websocket (thông qua props device)
  const [isOn, setIsOn] = useState<boolean>(device.status === EDeviceConnectStatus.CONNECTED);
  const progress = useSharedValue(device.status === EDeviceConnectStatus.CONNECTED ? 1 : 0);

  // Ref để khóa chống spam click nhanh
  const lastClickTime = useRef(0);

  // 2. Lắng nghe Websocket cập nhật trạng thái thực tế
  useEffect(() => {
    const currentStatus = device.status === EDeviceConnectStatus.CONNECTED;
    setIsOn(currentStatus);
    progress.value = withTiming(currentStatus ? 1 : 0, { duration: 300 });
  }, [device.status]);

  const handleToggleDevice = async () => {
    // Chống click quá nhanh (debounce 500ms)
    const now = Date.now();
    if (now - lastClickTime.current < 500) return;
    lastClickTime.current = now;

    const nextState = !isOn;

    if (allowHaptics) {
      // --- BƯỚC 1: HAPTIC FEEDBACK (Rung như bấm nút thật) ---
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // --- BƯỚC 2: OPTIMISTIC UI UPDATE ---
    setIsOn(nextState);
    progress.value = withTiming(nextState ? 1 : 0, { duration: 250 });

    try {
      // --- BƯỚC 3: GỬI LỆNH LÊN SERVER ---
      // await onToggleApi(device.id, nextState);
      // Không cần làm gì thêm, đợi Websocket bắn về qua props
    } catch (error) {
      // Rollback ngay nếu lỗi API (mất mạng cục bộ)
      setIsOn(!nextState);
      progress.value = withTiming(!nextState ? 1 : 0, { duration: 250 });
      if(allowHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const powerButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#E9ECF4', '#A3EC3E']
    ),
    // Hiệu ứng "nhún" nhẹ khi trạng thái thay đổi
    transform: [{ scale: withSpring(progress.value === 1 ? 1.05 : 1) }]
  }));

  // Giả sử progress.value chạy từ 0 -> 1
  const animatedGradientStyle = useAnimatedStyle(() => {
    return {
      // Animation mờ dần/hiện lên
      opacity: interpolate(
        progress.value,
        [0, 1],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const PowerButton = () => (
    <Animated.View style={[{ width: 32, height: 32, borderRadius: 17, padding: 7 }, powerButtonStyle]}>
      <PowerIcon color={'#1B1B1B'} size={18} />
    </Animated.View>
  );

  // Layout FullWidth
  if (typeViewDevice === ETypeViewDevice.FullWidth) {
    return (
      <TouchableOpacity onPress={handleToggleDevice} activeOpacity={0.9} className="w-full h-36 rounded-xl justify-between bg-white dark:bg-[#FFFFFF0D] shadow-sm p-3 border border-white dark:border-[#292929] overflow-hidden">
        <Animated.View style={[StyleSheet.absoluteFill, animatedGradientStyle]}>
          <LinearGradient
            // 180deg = Top to Bottom
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            colors={[
              'rgba(163, 236, 62, 0.20)', // Màu bắt đầu (0%)
              'transparent'               // Màu kết thúc (100%) - Thay bằng màu faded của bác
            ]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <View className="w-full flex-row justify-between">
          <View className="flex-1 flex-row gap-3">
            <Image source={device.image} style={{ width: 52, height: 52, borderRadius: 12 }} contentFit="cover" />
            <View className="justify-center">
              <Text className="text-lg font-bold text-neutral-800">{device.name}</Text>
              <Text className={isOn ? "text-[#A3EC3E] text-xs font-medium" : "text-neutral-400 text-xs"}>
                {isOn ? 'Đang hoạt động' : 'Đã tắt'}
              </Text>
            </View>
          </View>
          <PowerButton />
        </View>
        <View className="flex-row gap-4 pt-2">
          <Text className="text-neutral-400 text-[11px]">⚡ 225V</Text>
          <Text className="text-neutral-400 text-[11px]">⏳ Hẹn giờ: 22:00</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Layout Grid
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleToggleDevice}
      style={{ width: (layout.width - BASE_SPACE_HORIZONTAL * 2 - GAP_DEVICE_VIEW_MOBILE) / GRID_VIEW_DEVICE_MOBILE }}
      className="h-36 rounded-xl justify-between bg-white dark:bg-[#FFFFFF0D] border border-white dark:border-[#292929] shadow-sm p-3 overflow-hidden"
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedGradientStyle]}>
        <LinearGradient
          // 180deg = Top to Bottom
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          colors={[
            'rgba(163, 236, 62, 0.20)', // Màu bắt đầu (0%)
            'transparent'               // Màu kết thúc (100%) - Thay bằng màu faded của bác
          ]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View className="w-full flex-row justify-between items-start">
        <Image source={device.image} style={{ width: 64, height: 64 }} contentFit="cover" />
        <PowerButton />
      </View>
      <View>
        <Text className="text-[15px] font-bold text-neutral-800" numberOfLines={1}>{device.name}</Text>
        <Text className={isOn ? "text-[#A3EC3E] text-xs font-medium" : "text-neutral-400 text-xs"}>
          {isOn ? 'Đang hoạt động' : 'Đã tắt'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};