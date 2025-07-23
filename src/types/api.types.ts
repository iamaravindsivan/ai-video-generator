export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message?: string;
  code?: string;
  status?: number;
}

export interface LoginRequest {
  email: string;
}

export interface SignupRequest {
  email: string;
  fullName: string;
}

export interface AuthResponse {
  user: {
    userId: string;
    email: string;
    fullName?: string;
    roles: string[];
  };
  message?: string;
} 