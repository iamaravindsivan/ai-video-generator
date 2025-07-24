import axios from "@/lib/axios";
import {
  MARKETCHECK_API_BASE_URL,
  MARKETCHECK_US_API_KEY,
  MARKETCHECK_UK_API_KEY,
} from "@/lib/env";

function getApiKey(region: "usa" | "uk") {
  return region === "uk" ? MARKETCHECK_UK_API_KEY : MARKETCHECK_US_API_KEY;
}

function getBaseUrl() {
  return MARKETCHECK_API_BASE_URL;
}

export async function marketCheckGet(
  endpoint: string,
  region: "usa" | "uk",
  config?: any
) {
  const apiKey = getApiKey(region);
  const url = `${getBaseUrl()}${endpoint}${
    endpoint.includes("?") ? "&" : "?"
  }api_key=${apiKey}`;
  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error.message || "MarketCheck API error"
    );
  }
}

export async function fetchDealer(dealerId: string, region: "usa" | "uk") {
  const endpoint =
    region === "uk" ? `/dealer/car/uk/${dealerId}` : `/dealer/rv/${dealerId}`;
  return marketCheckGet(endpoint, region);
}
