import { View, TouchableOpacity, Text } from "@/components/ui"
import { BellIcon, SnownyIcon } from "@/components/ui/icons"
import { ETheme } from "@/types/base"
import AntDesign from "@expo/vector-icons/AntDesign"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useUniwind } from "uniwind"
import { PulseDot } from "../PulseDot"

export const PrimaryHeaderHome = () => {
  const {theme} = useUniwind()
  const insets = useSafeAreaInsets()
  return (
    <View
              className="w-full flex-row gap-2 px-4"
              style={{
                paddingTop: insets.top,
              }}
            >
              <View className="flex-1 flex-col">
                <TouchableOpacity className="flex-row items-center gap-2.5" onPress={() => { }}>
                  <AntDesign name="home" size={18} color={theme === ETheme.Light ? '#1B1B1B' : '#FFFFFF'} />
                  <Text className="text-[#1B1B1B] dark:text-white">Nhà của tôi</Text>
                  <AntDesign className="mt-1" name="caret-down" size={16} color={theme === ETheme.Light ? '#1B1B1B' : '#FFFFFF'} />
                </TouchableOpacity>
                <View className="flex-row items-center gap-1">
                  <SnownyIcon />
                  <Text className="text-sm text-[#06B6D4] dark:text-[#06B6D4]">20°C</Text>
                </View>
              </View>
              <View className="flex-1 flex-row justify-end gap-2">
                <View className="relative h-8 w-8 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
                  <BellIcon color={theme === ETheme.Light ? '#737373' : '#FFFFFF'} />
                  <PulseDot
                    color="#22C55E"
                    size={8}
                    duration={1200}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                    }}
                  />
                </View>
    
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white/40 shadow-sm dark:bg-black/40">
                  <AntDesign name="plus" size={16} color={theme === ETheme.Light ? '#737373' : '#FFFFFF'} />
                </View>
              </View>
            </View>
  )
}