import type { TFloor, THome, TRoom } from '@/lib/api/homes/home.service';

import { useQuery } from '@tanstack/react-query';

import { homeService } from '@/lib/api/homes/home.service';

// ============================================================
// QUERY KEYS
// ============================================================
export const homeKeys = {
  all: ['homes'] as const,
  floors: (homeId: string) => ['homes', homeId, 'floors'] as const,
  rooms: (homeId: string) => ['homes', homeId, 'rooms'] as const,
};

// ============================================================
// HOOKS
// ============================================================

/** Get all homes for current user */
export function useHomes() {
  return useQuery<THome[]>({
    queryKey: homeKeys.all,
    queryFn: homeService.getHomes,
  });
}

/** Get floors for a specific home (includes nested rooms) */
export function useFloors(homeId: string) {
  return useQuery<TFloor[]>({
    queryKey: homeKeys.floors(homeId),
    queryFn: () => homeService.getFloors(homeId),
    enabled: !!homeId,
  });
}

/** Get all rooms for a specific home */
export function useRooms(homeId: string) {
  return useQuery<TRoom[]>({
    queryKey: homeKeys.rooms(homeId),
    queryFn: () => homeService.getRooms(homeId),
    enabled: !!homeId,
  });
}
