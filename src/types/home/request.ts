export type TCreateRoomBody = {
  name: string;
  floorId?: string;
};

export type TUpdateRoomBody = {
  name?: string;
  floorId?: string | null;
};

export type TCreateFloorBody = {
  name: string;
  sortOrder?: number;
};

export type TUpdateFloorBody = {
  name?: string;
  sortOrder?: number;
};

export type TAssignRoomsBody = {
  roomIds: string[];
};

export type TAssignEntitiesBody = {
  entityIds: string[];
};

export type TAssignScenesBody = {
  sceneIds: string[];
};

// ============================================================
// API SERVICE
// ============================================================
