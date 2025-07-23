import { NextRequest } from "next/server";
import { findUserByEmail } from "@/lib/db/users";
import { createOTP } from "@/lib/db/otps";
import { createMagicLink } from "@/lib/db/magic-links";
import { sendLoginEmail } from "@/services/email";
import { RequestOTPSchema } from "@/lib/schemas/auth.schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
} from "@/lib/api/api-utils";
import { AUTH_CONFIG } from "@/lib/constants";
import { DONT_SEND_EMAILS } from "@/lib/env";
import crypto from "crypto";


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName } = RequestOTPSchema.parse(body);

    if (!fullName) {
      // Login flow
      const user = await findUserByEmail(email);
      if (!user) {
        return createErrorResponse(
          "We couldn't find an account with that email. Please sign up to create one."
        );
      }
    }

    // Generate OTP and token
    const otp = DONT_SEND_EMAILS ? "654321" : generateOTP();
    const token = generateToken();

    // Create OTP and magic link in database
    await createOTP(email, otp);
    await createMagicLink(email, token, AUTH_CONFIG.MAGIC_LINK_EXPIRY_MINUTES);

    if (DONT_SEND_EMAILS) {
      console.log(
        "[DEV MODE] OTP:",
        otp,
        "Email:",
        email,
        "Full Name:",
        fullName || "(login)"
      );
      return createSuccessResponse({ dev: true }, "OTP generated successfully");
    }

    // Send email
    try {
      const emailResult = await sendLoginEmail({ email, otp, token });

      if (emailResult.response?.status !== 200) {
        console.error("Email sending failed:", emailResult);
        return createErrorResponse(
          "Request processed. If the email exists, you will receive an OTP."
        );
      }
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      return createErrorResponse(
        "Request processed. If the email exists, you will receive an OTP."
      );
    }

    return createErrorResponse(
      "We couldn't find an account with that email. Please sign up to create one."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
