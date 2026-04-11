import type { TSceneFilterTab } from '../components/scene-filter-tab-bar';
import { useMemo } from 'react';
import { translate } from '@/lib/i18n';

// ─── Types ───────────────────────────────────────────────────────────────────

type TFloor = { id: string; name: string };
type TRoom = { id: string; name: string; floorId?: string };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSceneFilterTabs(floors: TFloor[], rooms: TRoom[]) {
  const floorNameMap = useMemo(
    () => Object.fromEntries(floors.map(f => [f.id, f.name])),
    [floors],
  );

  return useMemo<TSceneFilterTab[]>(() => {
    const floorTabs: TSceneFilterTab[] = floors.map(floor => ({
      id: `floor-${floor.id}`,
      label: floor.name,
    }));

    const roomTabs: TSceneFilterTab[] = rooms.map(room => ({
      id: `room-${room.id}`,
      label:
        room.floorId && floorNameMap[room.floorId]
          ? `${floorNameMap[room.floorId]} - ${room.name}`
          : room.name,
    }));

    return [
      { id: 'favorite', label: translate('scenes.filterFavorite') },
      ...floorTabs,
      ...roomTabs,
    ];
  }, [rooms, floors, floorNameMap]);
}
