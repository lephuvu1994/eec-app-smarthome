import type { THome } from '@/lib/api/homes/home.service';

export type THomeRole = 'OWNER' | 'MEMBER';

export type THomeManagerStore = {
  /** Danh sách tất cả nhà của user */
  homes: THome[];
  /** Nhà đang được chọn */
  selectedHome: THome | null;
  /** Role của current user trong selectedHome */
  selectedHomeRole: THomeRole | null;
  /** Shortcut — derived từ selectedHome.id */
  readonly selectedHomeId: string | null;
};

export type THomeManagerStoreState = THomeManagerStore & {
  /** Set toàn bộ danh sách nhà (gọi sau khi fetch API) */
  setHomes: (homes: THome[]) => void;
  /** Chọn nhà + gán role */
  setSelectedHome: (home: THome, role: THomeRole) => void;
  /** Reset về chưa chọn nhà */
  clearSelectedHome: () => void;
};
