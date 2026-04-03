import { getInvoicePreviewAssetAuthToken } from "@/lib/invoice-preview-asset-auth-store";
import { INVOICE_PREVIEW_ASSET_TOKEN_COOKIE, parseCookieValue } from "@/lib/invoice-preview-asset-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedAssetUrl(url: URL): boolean {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  if (!url.pathname.startsWith("/uploads/") && !url.pathname.startsWith("/drawable/")) {
    return false;
  }

  const allowedHosts = new Set<string>(["localhost", "127.0.0.1"]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    try {
      allowedHosts.add(new URL(apiBase).hostname);
    } catch {
      // Ignore invalid env url and rely on localhost fallbacks.
    }
  }

  return allowedHosts.has(url.hostname);
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const source = requestUrl.searchParams.get("src");
  const key = requestUrl.searchParams.get("key");

  if (!source || !key) {
    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Missing src or key", status: 400 } },
      { status: 400 },
    );
  }

  const keyToken = getInvoicePreviewAssetAuthToken(key);
  const cookieToken = parseCookieValue(
    request.headers.get("cookie"),
    INVOICE_PREVIEW_ASSET_TOKEN_COOKIE,
  );
  const token = keyToken || cookieToken;
  if (!token) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Missing or expired asset key", status: 401 } },
      { status: 401 },
    );
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(source);
  } catch {
    return Response.json(
      { error: { code: "BAD_REQUEST", message: "Invalid src url", status: 400 } },
      { status: 400 },
    );
  }

  if (!isAllowedAssetUrl(sourceUrl)) {
    return Response.json(
      { error: { code: "FORBIDDEN", message: "Asset source is not allowed", status: 403 } },
      { status: 403 },
    );
  }

  const upstream = await fetch(sourceUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!upstream) {
    return Response.json(
      { error: { code: "BAD_GATEWAY", message: "Failed to fetch upstream asset", status: 502 } },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return Response.json(
      {
        error: {
          code: "UPSTREAM_ERROR",
          message: `Asset request failed with status ${upstream.status}`,
          status: upstream.status,
        },
      },
      { status: upstream.status },
    );
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");
  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      ...(contentLength ? { "Content-Length": contentLength } : {}),
      "Cache-Control": "no-store",
    },
  });
}
