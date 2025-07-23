import api from "@/lib/axios";
import { API_ROUTES } from "@/lib/constants";
import { User } from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";
import { UpdateAccountData } from "@/types/user.types";

export const getAccount = async (): Promise<User> => {
  const res = await api.get<ApiResponse<{ user: User }>>(API_ROUTES.ACCOUNT);
  return res.data.data!.user;
};

export const updateAccount = async (data: UpdateAccountData): Promise<User> => {
  const res = await api.put<ApiResponse<{ user: User }>>(
    API_ROUTES.ACCOUNT,
    data
  );
  return res.data.data!.user;
};
