import type {
  TCreateFloorBody,
  TCreateRoomBody,
  TFloor,
  THome,
  TRoom,
  TUpdateFloorBody,
  TUpdateRoomBody,
} from '@/lib/api/homes/home.service';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { showErrorMessage, showSuccessMessage } from '@/components/ui';
import { homeService } from '@/lib/api/homes/home.service';
import { translate } from '@/lib/i18n';

// ============================================================
// QUERY KEYS
// ============================================================
export const homeKeys = {
  all: ['homes'] as const,
  floors: (homeId: string) => ['homes', homeId, 'floors'] as const,
  rooms: (homeId: string) => ['homes', homeId, 'rooms'] as const,
};

// ============================================================
// QUERY HOOKS
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

// ============================================================
// MUTATION HOOKS — FLOOR
// ============================================================

export function useCreateFloor(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TCreateFloorBody) => homeService.createFloor(homeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeKeys.floors(homeId) });
      showSuccessMessage(translate('roomManagement.floorCreated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useUpdateFloor(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ floorId, body }: { floorId: string; body: TUpdateFloorBody }) =>
      homeService.updateFloor(floorId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeKeys.floors(homeId) });
      showSuccessMessage(translate('roomManagement.floorUpdated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useDeleteFloor(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (floorId: string) => homeService.deleteFloor(homeId, floorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeKeys.floors(homeId) });
      showSuccessMessage(translate('roomManagement.floorDeleted'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

// ============================================================
// MUTATION HOOKS — ROOM
// ============================================================

export function useCreateRoom(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TCreateRoomBody) => homeService.createRoom(homeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeKeys.floors(homeId) });
      queryClient.invalidateQueries({ queryKey: homeKeys.rooms(homeId) });
      showSuccessMessage(translate('roomManagement.roomCreated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useUpdateRoom(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: string; body: TUpdateRoomBody }) =>
      homeService.updateRoom(roomId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeKeys.floors(homeId) });
      queryClient.invalidateQueries({ queryKey: homeKeys.rooms(homeId) });
      showSuccessMessage(translate('roomManagement.roomUpdated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useDeleteRoom(homeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => homeService.deleteRoom(homeId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeKeys.floors(homeId) });
      queryClient.invalidateQueries({ queryKey: homeKeys.rooms(homeId) });
      showSuccessMessage(translate('roomManagement.roomDeleted'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}
