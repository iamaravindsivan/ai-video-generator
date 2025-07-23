import { z } from "zod";
import { AUTH_CONFIG } from "@/lib/constants";
import { EmailSchema, FullNameSchema } from "./user.schemas";

export const OTPSchema = z
  .string()
  .length(
    AUTH_CONFIG.OTP_LENGTH,
    `OTP must be ${AUTH_CONFIG.OTP_LENGTH} digits`
  );

export const LoginRequestSchema = z.object({
  email: EmailSchema,
});

export const SignupRequestSchema = z.object({
  email: EmailSchema,
  fullName: FullNameSchema,
});

export const RequestOTPSchema = z.object({
  email: EmailSchema,
  fullName: FullNameSchema.optional(),
});

export const VerifyOTPSchema = z.object({
  email: EmailSchema,
  otp: OTPSchema,
  fullName: FullNameSchema.optional(),
});

export const VerifyMagicLinkSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const OTPDbSchema = z.object({
  _id: z.any().optional(),
  email: EmailSchema,
  otp: z.string().length(AUTH_CONFIG.OTP_LENGTH),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
  used: z.boolean().default(false),
});

export const MagicLinkDbSchema = z.object({
  _id: z.any().optional(),
  email: EmailSchema,
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
  used: z.boolean().default(false),
});
