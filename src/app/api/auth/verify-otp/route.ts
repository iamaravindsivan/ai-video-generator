import { NextRequest } from "next/server";
import { verifyOTP } from "@/lib/db/otps";
import { findUserByEmail } from "@/lib/db/users";
import { createUser } from "@/lib/db/users";
import { signJwt } from "@/lib/jwt";
import { VerifyOTPSchema } from "@/lib/schemas/auth.schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
} from "@/lib/api/api-utils";
import { HTTP_STATUS } from "@/lib/constants";
import type { AuthUser } from "@/types/user.types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, fullName } = VerifyOTPSchema.parse(body);

    const isValidOTP = await verifyOTP(email, otp);
    if (!isValidOTP) {
      return createErrorResponse(
        "Invalid or expired OTP",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    let user = await findUserByEmail(email);
    if (!user) {
      if (!fullName) {
        return createErrorResponse(
          "Full name required for signup.",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      user = await createUser({ email, fullName });
    }

    // Create JWT payload
    const authUser: AuthUser = {
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    };

    const token = await signJwt(authUser);

    const response = createSuccessResponse(
      { user: authUser },
      "Login successful"
    );

    // Set secure cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}