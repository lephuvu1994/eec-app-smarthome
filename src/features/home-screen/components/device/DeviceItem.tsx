import { TouchableOpacity, View } from "@/components/ui"
import { Image } from "expo-image"
import { TDevice } from "../../types/device"

type TProps = {
  device: TDevice
}

export const DeviceItem: React.FC<TProps> = ({ device }) => {
  return <TouchableOpacity onPress={() => {}} className="w-full h-36 rounded-xl bg-white shadow p-3">
    <View className="w-full flex-row gap-2 justify-between">
      <View className="w-full flex-row gap-2 justify-between">
        <Image source={device.image} className="w-16 h-20" contentFit="cover"/>
      </View>
    </View>
    <View></View>
  </TouchableOpacity>
}