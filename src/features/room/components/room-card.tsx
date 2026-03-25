import type { TRoom } from '@/lib/api/homes/home.service';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { Pressable, Text, View } from '@/components/ui';
import { useRoomActions } from '../hooks/use-room-actions';

type TRoomCardProps = {
  room: TRoom;
  idx?: number;
  isGrid: boolean;
};

// Use a placeholder random image per room based on ID length or character sum mapping
function getRoomPlaceholder(roomId: string) {
  const sum = roomId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const images = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1600607687920-4e2a09be1587?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=400',
  ];
  return images[sum % images.length];
};

export function RoomCard({ room, isGrid }: TRoomCardProps) {
  const router = useRouter();
  const { toggleRoomPower, triggerFavoriteScene } = useRoomActions();

  const handleNavigate = useCallback(() => {
    router.push(`/room/${room.id}`);
  }, [router, room.id]);

  const handleTogglePower = useCallback(() => {
    // Assuming 'true' for now until actual store maps it
    toggleRoomPower(room.id, true);
  }, [toggleRoomPower, room.id]);

  const handleFavorite = useCallback(() => {
    triggerFavoriteScene(room.id);
  }, [triggerFavoriteScene, room.id]);

  // Derived styling for Grid vs List
  const wrapperClass = isGrid
    ? 'flex-1 m-2 aspect-square rounded-[24px] overflow-hidden'
    : 'w-full h-[140px] mb-4 rounded-[24px] overflow-hidden';

  const imageUrl = getRoomPlaceholder(room.id);

  return (
    <View className={wrapperClass}>
      <Pressable onPress={handleNavigate} className="size-full">
        {/* Background Image */}
        <Image
          source={imageUrl}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />

        {/* Dark Overlay for Text Visibility */}
        <View className="absolute inset-0 bg-black/30" />

        {/* Top actions: Power and Favorite */}
        <View className="absolute inset-x-0 top-0 flex-row items-start justify-between p-3">
          <Pressable
            onPress={handleTogglePower}
            className="size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
          >
            <MaterialCommunityIcons name="power" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={handleFavorite}
            className="size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
          >
            <MaterialCommunityIcons name="heart" size={18} color="#EF4444" />
          </Pressable>
        </View>

        {/* Bottom Details: Room Name and Device Count */}
        <View className="absolute inset-x-0 bottom-0 p-4">
          <Text className="text-lg font-bold text-white shadow-sm" numberOfLines={1}>
            {room.name}
          </Text>
          <Text className="mt-0.5 text-xs text-white/80">
            {room.entities?.length || 0}
            {' '}
            Devices
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
