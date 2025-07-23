import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HTTP_STATUS } from "@/lib/constants";
import type { ApiResponse } from "@/types/api.types";

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = HTTP_STATUS.BAD_REQUEST
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Handles validation errors from Zod
 */
export function handleValidationError(
  error: ZodError
): NextResponse<ApiResponse> {
  const message = error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
  return createErrorResponse(
    `Validation error: ${message}`,
    HTTP_STATUS.BAD_REQUEST
  );
}

/**
 * Handles database errors
 */
export function handleDatabaseError(error: any): NextResponse<ApiResponse> {
  console.error("Database error:", error);

  if (error.message?.includes("already exists")) {
    return createErrorResponse(error.message, HTTP_STATUS.CONFLICT);
  }

  if (error.message?.includes("not found")) {
    return createErrorResponse(error.message, HTTP_STATUS.NOT_FOUND);
  }

  return createErrorResponse(
    "Internal server error",
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Generic error handler for API routes
 */
export function handleApiError(error: any): NextResponse<ApiResponse> {
  console.error("API error:", error);

  if (error instanceof ZodError) {
    return handleValidationError(error);
  }

  // Check if it's a database error
  if (error.message) {
    return handleDatabaseError(error);
  }

  return createErrorResponse(
    "An unexpected error occurred",
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}