import type { EHomeRole } from '@/features/auth/types/response';

export type TAuthHome = {
  id: string;
  name: string;
  role: EHomeRole;
};
