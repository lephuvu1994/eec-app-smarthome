import type { TMenuElement } from '@/components/ui/zeego-native-menu';
import type { TFloor, TRoom } from '@/lib/api/homes/home.service';

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
 * Cấu trúc:
 *   Phần 1 (cố định): Device Management + Room Management
 *   Phần 2 (động):
 *     - Flat mode (0 floors): rooms as flat items → navigate to room's primary tab
 *     - Grouped mode (≥1 floors): Floors → rooms submenu + Ungrouped Rooms
 */
export function useHomeMenu({ floors, allRooms, groupKeys, onNavigateToRoom }: TUseHomeMenuParams): TMenuElement[] {
  return useMemo(() => {
    // ─── Phần 1: Cố định ───────────────────────────
    const fixedItems: TMenuElement[] = [
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
    ];

    // ─── Phần 2: Động — floors + rooms ──────────────
    const dynamicItems: TMenuElement[] = [];
    const hasFloors = !!floors?.length;

    if (!hasFloors) {
      // FLAT MODE: mỗi room = 1 primary tab → flat menu items (không submenu)
      allRooms?.forEach((room) => {
        const groupIdx = groupKeys.findIndex(k => k === room.id);
        dynamicItems.push({
          key: room.id,
          title: room.name,
          icon: { ios: 'door.left.hand.open' },
          onPress: () => onNavigateToRoom(groupIdx, room.id),
        });
      });
    }
    else {
      // GROUPED MODE: floors → submenu rooms
      const findGroupIdx = (floorId: string) =>
        groupKeys.findIndex(k => k === floorId);

      floors.forEach((floor) => {
        if (!floor.rooms?.length)
          return;

        const groupIdx = findGroupIdx(floor.id);
        dynamicItems.push({
          key: floor.id,
          title: floor.name,
          icon: { ios: 'building.2' },
          children: floor.rooms.map(room => ({
            key: room.id,
            title: room.name,
            icon: { ios: 'door.left.hand.open' },
            onPress: () => onNavigateToRoom(groupIdx, room.id),
          })),
        });
      });

      // Ungrouped rooms (rooms không thuộc floor nào)
      const floorRoomIds = new Set(floors.flatMap(f => f.rooms?.map(r => r.id) ?? []));
      const ungroupedRooms = allRooms?.filter(r => !floorRoomIds.has(r.id)) ?? [];

      if (ungroupedRooms.length > 0) {
        const ungroupedIdx = groupKeys.findIndex(k => k === 'ungrouped');
        dynamicItems.push({
          key: 'ungrouped',
          title: translate('base.ungroupedRooms'),
          icon: { ios: 'questionmark.folder' },
          children: ungroupedRooms.map(room => ({
            key: `ungrouped-${room.id}`,
            title: room.name,
            icon: { ios: 'door.left.hand.open' },
            onPress: () => onNavigateToRoom(
              ungroupedIdx >= 0 ? ungroupedIdx : groupKeys.length - 1,
              room.id,
            ),
          })),
        });
      }
    }

    // Kết hợp: cố định + separator + động
    if (dynamicItems.length > 0) {
      return [
        ...fixedItems,
        { type: 'separator' as const, key: 'sep-1' },
        ...dynamicItems,
      ];
    }

    return fixedItems;
  }, [floors, allRooms, groupKeys, onNavigateToRoom]);
}
