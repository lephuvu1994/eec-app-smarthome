import { listDevice } from "./mockData";
import { DeviceItem } from "./DeviceItem";
import { View } from "react-native";
import { ETypeViewDevice, TDevice } from "@/types/device";
import { GAP_DEVICE_VIEW_MOBILE } from "@/constants";

export const ListDevice = () => {
  return (
    <View className="flex-row flex-wrap" style={{ gap: GAP_DEVICE_VIEW_MOBILE }}>
      {listDevice.map((device: TDevice, idx: number) => {
        if (device.type === "camera") {
          return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />
        } else if (device.type === "light") {
          return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />
        } else if (device.type === "alexa") {
          return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />
        }
        return <DeviceItem key={device.id} device={device} typeViewDevice={idx % 3 === 0 ? ETypeViewDevice.FullWidth : ETypeViewDevice.Grid} />
      })
      }
    </View>
  );
};