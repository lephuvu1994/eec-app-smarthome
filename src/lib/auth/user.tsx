import { TUser } from "@/features/auth/types/response";
import { getItem, removeItem, setItem } from "@/lib/storage";

const USER = "user";

export const getUserStore = () => getItem<TUser>(USER);
export const removeUserStore = () => removeItem(USER);
export const setUserStore = (value: TUser) => setItem<TUser>(USER, value);

