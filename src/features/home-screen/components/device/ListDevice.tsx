import { listDevice } from "./mockData";
import { DeviceItem } from "./DeviceItem";
import { TDevice } from "../../types/device";
import { View } from "react-native";

export const ListDevice = () => {
    return (
      <View className="flex-row gap-2 flex-wrap ">
      {listDevice.map((device: TDevice) => {
        if(device.type === "camera") {
          return <DeviceItem device={device} />
        } else if(device.type === "light") {
          return <DeviceItem device={device }/>
        } else if(device.type === "alexa") {
          return <DeviceItem device={device} />
        }
        return <DeviceItem device={device} />
      })
    }
      </View>
    );
};