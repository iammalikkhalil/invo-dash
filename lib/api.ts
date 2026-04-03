import { getAccessToken } from "@/lib/auth";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  WebpanelInventoryItemResponse,
  WebpanelInvoiceFullResponse,
  WebpanelInvoiceSummaryResponse,
  WebpanelTestingDeviceResponse,
  WebpanelUserWithStatsAndAnalyticsResponse,
  WebpanelUserWithStatsResponse,
  WebpanelUserStatsResponse,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
const IS_NGROK_BASE_URL = /https?:\/\/[^/]*ngrok[^/]*/i.test(API_BASE_URL);

export class ApiError extends Error {
  status: number;
  data: unknown;
  isNetworkError: boolean;

  constructor(
    message: string,
    options?: { status?: number; data?: unknown; isNetworkError?: boolean },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status ?? 500;
    this.data = options?.data ?? null;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

async function parseResponseBody<T>(response: Response): Promise<ApiResponse<T> | null> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  const requiresAuth = options.requiresAuth ?? true;

  headers.set("Content-Type", "application/json");
  if (IS_NGROK_BASE_URL) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

  if (requiresAuth) {
    const token = getAccessToken();

    if (!token) {
      throw new ApiError("Unauthorized", { status: 401 });
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
    });
  } catch (error) {
    throw new ApiError("Network error. Please check your connection and retry.", {
      status: 0,
      data: error,
      isNetworkError: true,
    });
  }

  const body = await parseResponseBody<T>(response);

  if (!response.ok) {
    throw new ApiError(body?.message || `Request failed with status ${response.status}`, {
      status: response.status,
      data: body?.data,
    });
  }

  if (!body) {
    throw new ApiError("Invalid server response.", {
      status: response.status,
    });
  }

  if (!body.success) {
    throw new ApiError(body.message || "Request failed.", {
      status: response.status,
      data: body.data,
    });
  }

  return body.data as T;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export const api = {
  login(payload: LoginRequest) {
    return apiRequest<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      requiresAuth: false,
    });
  },

  getAllUsersWithStats() {
    return apiRequest<WebpanelUserWithStatsResponse[]>("/v1/webpanel/getAllUsersWithStats");
  },

  getAllUsersWithStatAndAnalytics() {
    return apiRequest<WebpanelUserWithStatsAndAnalyticsResponse[]>(
      "/v1/webpanel/getAllUsersWithStatAndAnalytics",
    );
  },

  getTestingDevices() {
    return apiRequest<WebpanelTestingDeviceResponse[]>("/v1/webpanel/testing-devices");
  },

  async getUserStats(userId: string) {
    try {
      return await apiRequest<WebpanelUserStatsResponse>(
        `/v1/webpanel/statsByUserId?userId=${encodeURIComponent(userId)}`,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return apiRequest<WebpanelUserStatsResponse>(
          `/v1/webpanel/statsbyuserId?userId=${encodeURIComponent(userId)}`,
        );
      }

      throw error;
    }
  },

  getInvoices(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return apiRequest<WebpanelInvoiceSummaryResponse[]>(`/v1/webpanel/invoices${query}`);
  },

  getInvoiceById(invoiceId: string) {
    return apiRequest<WebpanelInvoiceFullResponse>(
      `/v1/webpanel/invoices/${encodeURIComponent(invoiceId)}`,
    );
  },

  getInventoryItems(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return apiRequest<WebpanelInventoryItemResponse[]>(`/v1/webpanel/inventory-items${query}`);
  },
};
