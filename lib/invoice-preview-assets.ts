export type InvoiceAssetKind = "missing" | "unsynced" | "resolved";

export interface InvoiceAssetResolution {
  kind: InvoiceAssetKind;
  rawValue: string | null;
  normalizedUrl: string | null;
  requestUrl: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

function toUploadsPath(pathname: string): string | null {
  if (!pathname.startsWith("/uploads/")) return null;
  return pathname;
}

function normalizeUploadsFromBase(path: string): string | null {
  if (!API_BASE_URL) return null;
  const trimmed = path.trim();
  const normalizedPath = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  if (!normalizedPath.startsWith("/uploads/")) return null;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function normalizeInvoiceAssetUrl(input: string | null | undefined): InvoiceAssetResolution {
  const rawValue = input?.trim() || null;
  if (!rawValue) {
    return { kind: "missing", rawValue: null, normalizedUrl: null, requestUrl: null };
  }

  const normalizedRaw = rawValue.replace(/\\/g, "/");
  if (normalizedRaw.toLowerCase().startsWith("drawable/")) {
    return { kind: "unsynced", rawValue, normalizedUrl: null, requestUrl: null };
  }

  if (normalizedRaw.startsWith("/uploads/") || normalizedRaw.startsWith("uploads/")) {
    const rewritten = normalizeUploadsFromBase(normalizedRaw);
    if (!rewritten) {
      return { kind: "missing", rawValue, normalizedUrl: null, requestUrl: null };
    }
    return { kind: "resolved", rawValue, normalizedUrl: rewritten, requestUrl: rewritten };
  }

  try {
    const parsed = new URL(normalizedRaw);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      const uploadsPath = toUploadsPath(parsed.pathname);
      if (!uploadsPath) {
        return { kind: "missing", rawValue, normalizedUrl: null, requestUrl: null };
      }

      const rewritten = normalizeUploadsFromBase(`${uploadsPath}${parsed.search}`);
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
