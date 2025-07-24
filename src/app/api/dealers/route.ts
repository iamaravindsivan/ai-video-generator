import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
} from "@/lib/api/api-utils";
import { createDealer, findAllDealers } from "@/lib/db/dealers";
import { HTTP_STATUS } from "@/lib/constants";
import { fetchDealer } from "@/services/marketCheckApi";
import { getServerUser } from "@/lib/getServerUser";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) {
      return createErrorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }
    const body = await request.json();
    const { dealerId, region } = body;
    if (!dealerId || !region) {
      return createErrorResponse(
        "Dealer ID and region are required",
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const dealerData = await fetchDealer(dealerId, region);
    const mappedDealer = {
      dealerId: dealerData.id,
      name: dealerData.seller_name,
      inventoryUrl: dealerData.inventory_url,
      dataSource: dealerData.data_source,
      status: dealerData.status,
      listingCount:
        typeof dealerData.listing_count === "number"
          ? dealerData.listing_count
          : undefined,
      dealerType: dealerData.dealer_type,
      street: dealerData.street,
      city: dealerData.city,
      state: dealerData.state,
      country: dealerData.country,
      zip: dealerData.zip,
      latitude: dealerData.latitude,
      longitude: dealerData.longitude,
      phone: dealerData.seller_phone,
      createdAt: new Date(),
      marketCheckCreatedAt: dealerData.created_at
        ? new Date(dealerData.created_at)
        : undefined,
    };
    const storedDealer = await createDealer(mappedDealer);
    return createSuccessResponse(
      storedDealer,
      "Dealer created and stored successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const currentUser = await getServerUser();
    if (!currentUser) {
      return createErrorResponse("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }
    const dealers = await findAllDealers();
    return createSuccessResponse(dealers, "Dealers fetched successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
