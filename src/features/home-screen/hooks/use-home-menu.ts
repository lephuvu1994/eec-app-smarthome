import type { TMenuElement } from '@/components/ui/zeego-native-menu';
import { TFloor, TRoom } from '@/types/home';

import { router } from 'expo-router';
import { useMemo } from 'react';

import { translate } from '@/lib/i18n';

type TNavigateToRoom = (groupIdx: number, roomId: string) => void;

type TUseHomeMenuParams = {
  floors: TFloor[] | undefined;
  allRooms: TRoom[] | undefined;
  groupKeys: string[];
  onNavigateToRoom: TNavigateToRoom;
};

/**
 * Xây dựng menuElements cho ZeegoNativeMenu trên Home Screen.
 *
 * Layout flat + grouped:
 *   Group 1 (cố định): Device Management + Room Management
 *   Group 2..N (động): mỗi floor = 1 group, rooms flat bên trong
 *     - Bấm floor title → jump to floor tab
 *     - Bấm room → jump to room
 *   Group cuối: Ungrouped rooms (nếu có)
 */
export function useHomeMenu({ floors, allRooms, groupKeys, onNavigateToRoom }: TUseHomeMenuParams): TMenuElement[] {
  return useMemo(() => {
    // ─── Group 1: Cố định ───────────────────────────
    const fixedGroup: TMenuElement = {
      type: 'group',
      key: 'fixed',
      items: [
        {
          key: 'device-management',
          title: translate('base.deviceManagement'),
          icon: { ios: 'iphone.gen3' },
          onPress: () => router.push('/(app)/(mobile)/device-management' as any),
        },
        {
          key: 'room-management',
          title: translate('base.roomManagement'),
          icon: { ios: 'square.grid.2x2' },
          onPress: () => router.push('/(app)/(mobile)/home-management' as any),
        },
      ],
    };

    // ─── Dynamic groups ──────────────────────────
    const dynamicGroups: TMenuElement[] = [];
    const hasFloors = !!floors?.length;

    if (!hasFloors) {
      // FLAT MODE: 0 floors → tất cả rooms flat trong 1 group
      if (allRooms?.length) {
        const roomItems: TMenuElement[] = allRooms.map((room) => {
          const groupIdx = groupKeys.findIndex(k => k === room.id);
          return {
            key: room.id,
            title: room.name,
            icon: { ios: 'door.left.hand.open' },
            onPress: () => onNavigateToRoom(groupIdx, room.id),
          };
        });

        dynamicGroups.push({
          type: 'group',
          key: 'all-rooms',
          title: translate('base.roomManagement'),
          items: roomItems,
        });
      }
    }
    else {
      // GROUPED MODE: mỗi floor = 1 group
      floors
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach((floor) => {
          const groupIdx = groupKeys.findIndex(k => k === floor.id);

          const floorItem: TMenuElement = {
            key: `floor-${floor.id}`,
            title: floor.name,
            icon: { ios: 'folder' },
            onPress: () => onNavigateToRoom(groupIdx, ''),
          };

          const roomItems: TMenuElement[] = (floor.rooms ?? []).map(room => ({
            key: room.id,
            title: `  ${room.name}`,
            onPress: () => onNavigateToRoom(groupIdx, room.id),
          }));

          dynamicGroups.push({
            type: 'group',
            key: `group-${floor.id}`,
            items: [floorItem, ...roomItems],
          });
        });

      // Ungrouped rooms
      const floorRoomIds = new Set(floors.flatMap(f => f.rooms?.map(r => r.id) ?? []));
      const ungroupedRooms = allRooms?.filter(r => !floorRoomIds.has(r.id)) ?? [];

      if (ungroupedRooms.length > 0) {
        const ungroupedIdx = groupKeys.findIndex(k => k === 'ungrouped');

        const ungroupedHeader: TMenuElement = {
          key: 'ungrouped-header',
          title: translate('base.ungroupedRooms'),
          icon: { ios: 'folder' },
          onPress: () => onNavigateToRoom(
            ungroupedIdx >= 0 ? ungroupedIdx : groupKeys.length - 1,
            '',
          ),
        };

        const ungroupedItems: TMenuElement[] = ungroupedRooms.map(room => ({
          key: `ungrouped-${room.id}`,
          title: `  ${room.name}`,
          onPress: () => onNavigateToRoom(
            ungroupedIdx >= 0 ? ungroupedIdx : groupKeys.length - 1,
            room.id,
          ),
        }));

        dynamicGroups.push({
          type: 'group',
          key: 'ungrouped',
          items: [ungroupedHeader, ...ungroupedItems],
        });
      }
    }

    return [fixedGroup, ...dynamicGroups];
  }, [floors, allRooms, groupKeys, onNavigateToRoom]);
}
