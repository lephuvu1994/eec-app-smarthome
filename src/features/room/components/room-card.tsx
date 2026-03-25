import type { TRoom } from '@/lib/api/homes/home.service';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import Animated from 'react-native-reanimated';

import { Pressable, Text, View, WIDTH } from '@/components/ui';
import { useRoomActions } from '../hooks/use-room-actions';

type TRoomCardProps = {
  room: TRoom;
  idx?: number;
  isGrid: boolean;
};

// Use a placeholder random image per room based on ID character sum
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
}

// Explicit image dimensions for shared element — Reanimated needs known size
const LIST_CARD_HEIGHT = 140;
const GRID_CARD_SIZE = (WIDTH - 48) / 2; // padding 16 + gap ~16

export function RoomCard({ room, isGrid }: TRoomCardProps) {
  const router = useRouter();
  const { toggleRoomPower, triggerFavoriteScene } = useRoomActions();

  const handleNavigate = useCallback(() => {
    router.push(`./${room.id}`);
  }, [router, room.id]);

  const handleTogglePower = useCallback(() => {
    toggleRoomPower(room.id, true);
  }, [toggleRoomPower, room.id]);

  const handleFavorite = useCallback(() => {
    triggerFavoriteScene(room.id);
  }, [triggerFavoriteScene, room.id]);

  const imageUrl = getRoomPlaceholder(room.id);

  const cardWidth = isGrid ? GRID_CARD_SIZE : WIDTH - 32;
  const cardHeight = isGrid ? GRID_CARD_SIZE : LIST_CARD_HEIGHT;

  return (
    <View
      className={isGrid ? 'm-2 overflow-hidden rounded-[24px]' : 'mb-4 overflow-hidden rounded-[24px]'}
      style={{ width: cardWidth, height: cardHeight }}
    >
      <Pressable onPress={handleNavigate} className="size-full">
        {/* Background Image with Shared Transition — explicit dimensions required */}
        <Animated.Image
          sharedTransitionTag={`room-img-${room.id}`}
          source={{ uri: imageUrl }}
          style={{ width: cardWidth, height: cardHeight }}
          resizeMode="cover"
        />

        {/* Dark Overlay + Content (absolute on top of image) */}
        <View className="absolute inset-0 bg-black/30">
          {/* Top actions: Power and Favorite */}
          <View className="flex-row items-start justify-between p-3">
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

          {/* Bottom Details */}
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
        </View>
      </Pressable>
    </View>
  );
}
