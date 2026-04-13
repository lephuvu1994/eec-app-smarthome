import type { TAssignEntitiesBody, TAssignRoomsBody, TAssignScenesBody, TCreateFloorBody, TCreateRoomBody, TFloor, TRoom, TUpdateFloorBody, TUpdateRoomBody } from '@/types/home';

import { useMutation, useQuery } from '@tanstack/react-query';

import { showErrorMessage, showSuccessMessage } from '@/components/ui';
import { homeService } from '@/lib/api/homes/home.service';
import { translate } from '@/lib/i18n';
import { useDeviceStore } from '@/stores/device/device-store';
import { useHomeDataStore } from '@/stores/home/home-data-store';

// ============================================================
// QUERY KEYS
// ============================================================
export const homeKeys = {
  floors: (homeId: string) => ['homes', homeId, 'floors'] as const,
  rooms: (homeId: string) => ['homes', homeId, 'rooms'] as const,
};

// ============================================================
// QUERY HOOKS
// ============================================================

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
// MUTATION HOOKS — FLOOR (optimistic store update)
// ============================================================

export function useCreateFloor(homeId: string) {
  return useMutation({
    mutationFn: (body: TCreateFloorBody) => homeService.createFloor(homeId, body),
    onSuccess: (floor) => {
      useHomeDataStore.getState().addFloor(floor);
      showSuccessMessage(translate('roomManagement.floorCreated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useUpdateFloor() {
  return useMutation({
    mutationFn: ({ floorId, body }: { floorId: string; body: TUpdateFloorBody }) =>
      homeService.updateFloor(floorId, body),
    onSuccess: (floor) => {
      useHomeDataStore.getState().updateFloor(floor.id, floor);
      showSuccessMessage(translate('roomManagement.floorUpdated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useAssignRooms() {
  return useMutation({
    mutationFn: ({ floorId, body }: { floorId: string; body: TAssignRoomsBody }) =>
      homeService.assignRoomsToFloor(floorId, body),
    onSuccess: (floor) => {
      useHomeDataStore.getState().updateFloor(floor.id, floor);
      showSuccessMessage(translate('roomManagement.floorUpdated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useDeleteFloor() {
  return useMutation({
    mutationFn: (floorId: string) => homeService.deleteFloor(floorId),
    onMutate: (floorId) => {
      // Optimistic: remove floor, ungrouped rooms
      const prev = { floors: useHomeDataStore.getState().floors, rooms: useHomeDataStore.getState().rooms };
      useHomeDataStore.getState().removeFloor(floorId);
      return prev;
    },
    onSuccess: () => {
      showSuccessMessage(translate('roomManagement.floorDeleted'));
    },
    onError: (error: any, _floorId, context) => {
      // Rollback
      if (context) {
        useHomeDataStore.getState().setFloors(context.floors);
        useHomeDataStore.getState().setRooms(context.rooms);
      }
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

// ============================================================
// MUTATION HOOKS — ROOM (optimistic store update)
// ============================================================

export function useCreateRoom(homeId: string) {
  return useMutation({
    mutationFn: (body: TCreateRoomBody) => homeService.createRoom(homeId, body),
    onSuccess: (room) => {
      useHomeDataStore.getState().addRoom(room);
      showSuccessMessage(translate('roomManagement.roomCreated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useUpdateRoom() {
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: string; body: TUpdateRoomBody }) =>
      homeService.updateRoom(roomId, body),
    onSuccess: (room) => {
      useHomeDataStore.getState().updateRoom(room.id, room);
      showSuccessMessage(translate('roomManagement.roomUpdated'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useDeleteRoom() {
  return useMutation({
    mutationFn: (roomId: string) => homeService.deleteRoom(roomId),
    onMutate: (roomId) => {
      const prev = useHomeDataStore.getState().rooms;
      useHomeDataStore.getState().removeRoom(roomId);
      return prev;
    },
    onSuccess: () => {
      showSuccessMessage(translate('roomManagement.roomDeleted'));
    },
    onError: (error: any, _roomId, context) => {
      if (context)
        useHomeDataStore.getState().setRooms(context);
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useAssignEntitiesToRoom() {
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: string; body: TAssignEntitiesBody }) =>
      homeService.assignEntitiesToRoom(roomId, body),
    onSuccess: (room, { roomId, body }) => {
      useHomeDataStore.getState().updateRoom(room.id, room);

      // Sync useDeviceStore: update room field on assigned/unassigned devices
      const { devices } = useDeviceStore.getState();
      const assignedIds = new Set(body.entityIds);
      const updatedDevices = devices.map((d) => {
        if (assignedIds.has(d.id)) {
          // Device was assigned to this room
          return { ...d, room: { id: roomId, name: room.name } };
        }
        if (d.room?.id === roomId && !assignedIds.has(d.id)) {
          // Device was previously in this room but removed from list
          return { ...d, room: null };
        }
        return d;
      });
      useDeviceStore.getState().setDevices(updatedDevices);

      showSuccessMessage(translate('roomManagement.featuresAssigned'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}

export function useAssignScenesToRoom() {
  return useMutation({
    mutationFn: ({ roomId, body }: { roomId: string; body: TAssignScenesBody }) =>
      homeService.assignScenesToRoom(roomId, body),
    onSuccess: (room) => {
      useHomeDataStore.getState().updateRoom(room.id, room);
      showSuccessMessage(translate('roomManagement.scenesAssigned'));
    },
    onError: (error: any) => {
      showErrorMessage(error?.message ?? translate('base.somethingWentWrong'));
    },
  });
}
