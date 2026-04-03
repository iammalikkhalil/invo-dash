export type InvoiceAssetKind = "missing" | "unsynced" | "resolved";

export interface InvoiceAssetResolution {
  kind: InvoiceAssetKind;
  rawValue: string | null;
  normalizedUrl: string | null;
  requestUrl: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
const LOCAL_ASSET_HOSTS = new Set<string>(["localhost", "127.0.0.1"]);
const ASSET_PATH_PREFIXES = ["/uploads/", "/drawable/"] as const;

function toKnownAssetPath(pathname: string): string | null {
  const match = ASSET_PATH_PREFIXES.find((prefix) => pathname.startsWith(prefix));
  return match ? pathname : null;
}

function normalizeAssetFromBase(path: string): string | null {
  if (!API_BASE_URL) return null;
  const trimmed = path.trim();
  const normalizedPath = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  if (!toKnownAssetPath(normalizedPath)) return null;
  return `${API_BASE_URL}${normalizedPath}`;
}

function isRewritableAssetHost(hostname: string): boolean {
  if (LOCAL_ASSET_HOSTS.has(hostname)) return true;

  if (!API_BASE_URL) return false;
  try {
    return new URL(API_BASE_URL).hostname === hostname;
  } catch {
    return false;
  }
}

export function normalizeInvoiceAssetUrl(input: string | null | undefined): InvoiceAssetResolution {
  const rawValue = input?.trim() || null;
  if (!rawValue) {
    return { kind: "missing", rawValue: null, normalizedUrl: null, requestUrl: null };
  }

  const normalizedRaw = rawValue.replace(/\\/g, "/");

  if (
    normalizedRaw.startsWith("/uploads/") ||
    normalizedRaw.startsWith("uploads/") ||
    normalizedRaw.startsWith("/drawable/") ||
    normalizedRaw.startsWith("drawable/")
  ) {
    const rewritten = normalizeAssetFromBase(normalizedRaw);
    if (!rewritten) {
      return { kind: "missing", rawValue, normalizedUrl: null, requestUrl: null };
    }
    return { kind: "resolved", rawValue, normalizedUrl: rewritten, requestUrl: rewritten };
  }

  try {
    const parsed = new URL(normalizedRaw);
    if (isRewritableAssetHost(parsed.hostname)) {
      const assetPath = toKnownAssetPath(parsed.pathname);
      if (!assetPath) {
        return { kind: "missing", rawValue, normalizedUrl: null, requestUrl: null };
      }

      const rewritten = normalizeAssetFromBase(`${assetPath}${parsed.search}`);
      if (!rewritten) {
        return { kind: "missing", rawValue, normalizedUrl: null, requestUrl: null };
      }
      return { kind: "resolved", rawValue, normalizedUrl: rewritten, requestUrl: rewritten };
    }

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return { kind: "resolved", rawValue, normalizedUrl: parsed.toString(), requestUrl: parsed.toString() };
    }
  } catch {
    return { kind: "missing", rawValue, normalizedUrl: null, requestUrl: null };
  }

  return { kind: "missing", rawValue, normalizedUrl: null, requestUrl: null };
}

export function resolveInvoiceAsset(
  input: string | null | undefined,
  assetAuthKey?: string | null,
): InvoiceAssetResolution {
  const normalized = normalizeInvoiceAssetUrl(input);
  if (normalized.kind !== "resolved" || !normalized.normalizedUrl) {
    return normalized;
  }

  if (!assetAuthKey) {
    return normalized;
  }

  const proxyUrl = `/api/invoice-preview/asset?src=${encodeURIComponent(normalized.normalizedUrl)}&key=${encodeURIComponent(assetAuthKey)}`;
  return {
    ...normalized,
    requestUrl: proxyUrl,
  };
}
