import type { TDeviceEntity } from '../device';
import type { TScene } from '../scene';

export type THome = {
  id: string;
  name: string;
  ownerId: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
};

export type TFloor = {
  id: string;
  name: string;
  homeId: string;
  sortOrder: number;
  rooms?: TRoom[];
};

export type TRoom = {
  id: string;
  name: string;
  sortOrder: number;
  homeId: string;
  floorId?: string;
  entities?: TDeviceEntity[];
  scenes?: TScene[];
  devices?: TDeviceEntity[];
};

/** GET /homes trả về home kèm floors + rooms */

export type THomeWithFloors = THome & {
  floors: TFloor[];
  rooms: TRoom[];
};

/** GET /homes/:id/detail */

export type THomeDetail = {
  home: THome;
  floors: TFloor[];
  rooms: TRoom[];
};
