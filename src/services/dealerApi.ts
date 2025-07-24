import api from "@/lib/axios";
import { API_ROUTES } from "@/lib/constants";
import type { ApiResponse } from "@/types/api.types";

export const createDealer = async (dealerId: string, region: "usa" | "uk") => {
  const res = await api.post<ApiResponse<any>>(API_ROUTES.DEALERS, {
    dealerId,
    region,
  });
  return res.data.data;
};

export const getDealers = async () => {
  const res = await api.get<ApiResponse<any[]>>(API_ROUTES.DEALERS);
  return res.data.data;
};
