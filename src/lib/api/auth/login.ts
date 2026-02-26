import type { AxiosError } from "axios";
import { createMutation } from "react-query-kit";

import { client } from "../common";
import { UserResponse } from "@/features/auth/types/response";

type Variables = { identifier: string; password: string };
type Response = UserResponse;

export const useLogin = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) => {
    const resultData = await client.post<UserResponse>("/auth/login", variables);
    return resultData.data;
  },
});
