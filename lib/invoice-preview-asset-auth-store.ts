interface AssetAuthEntry {
  token: string;
  createdAt: number;
}

const ASSET_AUTH_TTL_MS = 5 * 60 * 1000;

const globalAssetAuthStore = globalThis as typeof globalThis & {
  __invoicePreviewAssetAuthStore?: Map<string, AssetAuthEntry>;
};

function getStore(): Map<string, AssetAuthEntry> {
  if (!globalAssetAuthStore.__invoicePreviewAssetAuthStore) {
    globalAssetAuthStore.__invoicePreviewAssetAuthStore = new Map<string, AssetAuthEntry>();
  }
  return globalAssetAuthStore.__invoicePreviewAssetAuthStore;
}

function cleanupExpired(store: Map<string, AssetAuthEntry>): void {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now - value.createdAt > ASSET_AUTH_TTL_MS) {
      store.delete(key);
    }
  }
}

function createAssetAuthKey(): string {
  if ("randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveInvoicePreviewAssetAuthToken(token: string): string {
  const store = getStore();
  cleanupExpired(store);
  const key = createAssetAuthKey();
  store.set(key, { token, createdAt: Date.now() });
  return key;
}

export function getInvoicePreviewAssetAuthToken(key: string | null | undefined): string | null {
  if (!key) return null;
  const store = getStore();
  cleanupExpired(store);
  return store.get(key)?.token ?? null;
}
