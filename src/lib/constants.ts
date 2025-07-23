// Application constants
export const APP_CONFIG = {
  name: "Video Generator AI",
  version: "1.0.0",
  description: "Video Generator AI - Generate videos with AI.",
} as const;

// Authentication constants
export const AUTH_CONFIG = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAGIC_LINK_EXPIRY_MINUTES: 15,
  TOKEN_CLEANUP_DAYS: 1,
} as const;

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// API routes
export const API_ROUTES = {
  // Auth
  REQUEST_OTP: "/auth/request-otp",
  VERIFY_OTP: "/auth/verify-otp",
  VERIFY_MAGIC_LINK: "/auth/verify-magic-link",
  LOGOUT: "/auth/logout",

  // Account
  ACCOUNT: "/account",
} as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/magic-link",
  "/api/auth/request-otp",
  "/api/auth/verify-otp",
  "/api/auth/verify-magic-link",
] as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
