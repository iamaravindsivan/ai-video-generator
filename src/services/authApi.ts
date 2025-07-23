import api from "@/lib/axios";
import { API_ROUTES } from "@/lib/constants";
import type { OTPRequest, VerifyOTPData, VerifyMagicLinkData, AuthUser } from "@/types/user.types";
import type { ApiResponse } from "@/types/api.types";

export const requestOTP = async (data: OTPRequest): Promise<void> => {
  await api.post(API_ROUTES.REQUEST_OTP, data);
};

export const verifyOTP = async (data: VerifyOTPData): Promise<AuthUser> => {
  const res = await api.post<ApiResponse<{ user: AuthUser }>>(API_ROUTES.VERIFY_OTP, data);
  return res.data.data!.user;
};

export const verifyMagicLink = async (data: VerifyMagicLinkData): Promise<AuthUser> => {
  const res = await api.post<ApiResponse<{ user: AuthUser }>>(API_ROUTES.VERIFY_MAGIC_LINK, data);
  return res.data.data!.user;
};

export const logout = async (): Promise<void> => {
  await api.post(API_ROUTES.LOGOUT);
}; 