export const INVOICE_PREVIEW_ASSET_TOKEN_COOKIE = "invoice_preview_asset_token";

export function parseCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawKey, ...rawValueParts] = cookie.trim().split("=");
    if (rawKey !== name) continue;
    const value = rawValueParts.join("=");
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}
