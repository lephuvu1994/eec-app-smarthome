import { Ionicons } from '@expo/vector-icons';
import { useUniwind } from 'uniwind';
import { Text, View } from '@/components/ui';
import { MenuNative } from '@/components/ui/menu-native';
import { NativeButton } from '@/components/ui/native-button';
import { useGetUser } from '@/features/auth/user-store';

export function ParalaxRoomHeader() {
  const { userName } = useGetUser();
  const { theme } = useUniwind();
  return (
    <View className="px-4">
      {/* Header */}
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="flex-col items-center gap-2">
            <Ionicons
              name="home"
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </View>
          <Text className="text-xl font-bold">
            Nhà của
            {userName}
          </Text>
        </View>
        <MenuNative
          containerStyle={{
            width: 36,
            height: 24,
          }}
          triggerComponent={(
            <NativeButton>
              <Ionicons
                name="add"
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
              />
            </NativeButton>
          )}
          listItem={[
            {
              key: '1',
              element: <NativeButton>Thêm phòng yêu thích</NativeButton>,
            },
            {
              key: '2',
              element: <NativeButton>Thêm thiết bị yêu thích</NativeButton>,
            },
            {
              key: '3',
              element: <NativeButton>Thêm kịch bản yêu thích</NativeButton>,
            },
            {
              key: '4',
              element: <NativeButton>Quét</NativeButton>,
            },
          ]}
        />
      </View>
    </View>
  );
};
