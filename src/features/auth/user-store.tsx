import { create } from "zustand";

import { TUser } from "./types/response";
import { getUserStore, removeUserStore, setUserStore } from "@/lib/auth/user";
import { createSelectors } from "@/lib/utils";

export type UserState = TUser & {
    setUser: (user: TUser) => void;
    removeUser: () => void;
    hydrate: () => void;
  };

const _useGetUser = create<UserState>((set, get) => ({
  id: "",
  email: null,
  phone:null,
  avatar: null,
  userName: "",
  role: "",
  created_at: "",
  updated_at: "",
  setUser: (user: TUser) => {
    setUserStore(user);
    set({ ...user });
  },
  removeUser: () => {
    removeUserStore();
  },
  hydrate: async () => {
    try {
      const user: TUser | null = getUserStore();
      if (user !== null) {
        get().setUser(user);
      }
    } catch (e) {
      // catch error here
      // Maybe sign_out user!
    }
  },
}));

export const useGetUser = createSelectors(_useGetUser);
export const hydrateUserStore = () => useGetUser.getState().hydrate();
