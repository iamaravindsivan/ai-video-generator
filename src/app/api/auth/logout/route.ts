import { createSuccessResponse } from "@/lib/api/api-utils";

export async function POST() {
  const response = createSuccessResponse(null, "Logged out successfully");

  // Clear the authentication cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
  });

  return response;
}
