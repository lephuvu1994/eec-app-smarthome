import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Image, View } from '@/components/ui';

export const icons: { [key: string]: any } = {
  '(room)': (props: any) => <MaterialCommunityIcons name="home-outline" size={26} {...props} />,
  '(smart)': (props: any) => (
    <Ionicons name="play-circle-outline" size={28} {...props} />
  ),
  'add': (props: any) => <View className="h-[28px] w-[28px] items-center justify-center" {...props}><Image className="h-[64px] w-[64px]" source={require('@@/assets/icons/voice-icon.png')} /></View>,
  '(settings)': (props: any) => (
    <AntDesign name="setting" size={26} {...props} />
  ),
  '(home)': (props: any) => <AntDesign name="home" size={26} {...props} />,
};
