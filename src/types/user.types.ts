export interface User {
  _id: string;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
}

// Auth-specific user type (for JWT payload and AuthContext)
export interface AuthUser {
  userId: string;
  email: string;
  fullName?: string;
  roles: string[];
}
export interface CreateUserData {
  email: string;
  fullName: string;
  roles?: string[];
}

export interface UpdateAccountData {
  fullName: string;
}

export interface OTPRequest {
  email: string;
  fullName?: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
  fullName?: string;
}

export interface VerifyMagicLinkData {
  token: string;
}