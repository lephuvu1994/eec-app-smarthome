import type { TSceneCard } from '../components/sortable-scene-grid';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type TSceneData = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  roomId?: string | null;
  actions?: any[];
};

type TRoomData = {
  id: string;
  floorId?: string;
};

type TVariant = 'tapToRun' | 'automation';

// ─── Color configs ────────────────────────────────────────────────────────────

const VARIANT_COLORS: Record<TVariant, {
  cardColor: string;
  iconBgColor: string;
  textColor: string;
  menuIconColor: string;
  iconColor: string;
  defaultIcon: string;
}> = {
  tapToRun: {
    cardColor: '#ECFDF5',
    iconBgColor: '#D1FAE5',
    textColor: '#065F46',
    menuIconColor: '#10B981',
    iconColor: '#10B981',
    defaultIcon: 'lightning-bolt',
  },
  automation: {
    cardColor: '#FFFFFF',
    iconBgColor: '#F2FCEE',
    textColor: '#1B1B1B',
    menuIconColor: '#9CA3AF',
    iconColor: '#84CC16',
    defaultIcon: 'home-outline',
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMapSceneToCard(rooms: TRoomData[], variant: TVariant) {
  const colorConfig = VARIANT_COLORS[variant];

  return useCallback(
    (scene: TSceneData): TSceneCard => {
      const filterTags: string[] = [];
      // Uncomment when BE logic is ready: if (scene.isFavorite) filterTags.push('favorite');
      if (scene.roomId) {
        filterTags.push(`room-${scene.roomId}`);
        const room = rooms.find(r => r.id === scene.roomId);
        if (room?.floorId) {
          filterTags.push(`floor-${room.floorId}`);
        }
      }

      return {
        key: scene.id,
        title: scene.name,
        colSpan: 1,
        cardColor: scene.color ?? colorConfig.cardColor,
        iconBgColor: colorConfig.iconBgColor,
        textColor: colorConfig.textColor,
        menuIconColor: colorConfig.menuIconColor,
        icon: (
          <MaterialCommunityIcons
            name={(scene.icon as any) ?? colorConfig.defaultIcon}
            size={20}
            color={colorConfig.iconColor}
          />
        ),
        filterTags,
        isDisabled: !scene.actions || scene.actions.length === 0,
      };
    },
    [rooms, colorConfig],
  );
}
