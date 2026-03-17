import type { InvoicePreviewDocument } from "@/features/invoice-preview/types/invoice-preview.types";

interface PayloadEntry {
  data: InvoicePreviewDocument;
  createdAt: number;
}

const PAYLOAD_TTL_MS = 2 * 60 * 1000;

const globalPayloadStore = globalThis as typeof globalThis & {
  __invoicePreviewPayloads?: Map<string, PayloadEntry>;
};

function getStore(): Map<string, PayloadEntry> {
  if (!globalPayloadStore.__invoicePreviewPayloads) {
    globalPayloadStore.__invoicePreviewPayloads = new Map<string, PayloadEntry>();
  }
  return globalPayloadStore.__invoicePreviewPayloads;
}

function cleanupExpired(store: Map<string, PayloadEntry>): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > PAYLOAD_TTL_MS) {
      store.delete(key);
    }
  }
}

function createPayloadKey(): string {
  if ("randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function saveInvoicePreviewPayload(data: InvoicePreviewDocument): string {
  const store = getStore();
  cleanupExpired(store);
  const key = createPayloadKey();
  store.set(key, { data, createdAt: Date.now() });
  return key;
}

export function consumeInvoicePreviewPayload(key: string | null | undefined): InvoicePreviewDocument | null {
  if (!key) return null;
  const store = getStore();
  cleanupExpired(store);

  const entry = store.get(key);
  if (!entry) return null;

  store.delete(key);
  return entry.data;
}
