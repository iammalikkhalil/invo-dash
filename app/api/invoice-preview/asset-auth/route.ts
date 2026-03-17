import { saveInvoicePreviewAssetAuthToken } from "@/lib/invoice-preview-asset-auth-store";
import { INVOICE_PREVIEW_ASSET_TOKEN_COOKIE } from "@/lib/invoice-preview-asset-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Missing bearer token", status: 401 } },
      { status: 401 },
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid bearer token", status: 401 } },
      { status: 401 },
    );
  }

  const key = saveInvoicePreviewAssetAuthToken(token);
  return Response.json(
    { key },
    {
      headers: {
        "Set-Cookie": `${INVOICE_PREVIEW_ASSET_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=300; SameSite=Lax`,
      },
    },
  );
}
