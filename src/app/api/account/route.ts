import { NextRequest } from "next/server";
import { findUserByEmail, updateUser } from "@/lib/db/users";
import { getServerUser } from "@/lib/getServerUser";
import { UpdateAccountSchema } from "@/lib/schemas/user.schemas";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
} from "@/lib/api/api-utils";
import { HTTP_STATUS } from "@/lib/constants";

export async function GET() {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) {
      return createErrorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await findUserByEmail(currentUser.email);
    if (!user) {
      return createSuccessResponse(
        null,
        "User not found",
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createSuccessResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) {
      return createErrorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const body = await request.json();
    const validatedData = UpdateAccountSchema.parse(body);

    const user = await updateUser(currentUser.userId, validatedData);
    return createSuccessResponse({ user }, "Account updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}