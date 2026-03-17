"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { InvoicePreviewScreen } from "@/features/invoice-preview";
import { mapWebpanelInvoiceToPreviewDocument } from "@/features/invoice-preview/mappers/mapWebpanelInvoiceToPreview";
import { api, ApiError, getErrorMessage, isUnauthorizedError } from "@/lib/api";
import { clearAccessToken, getAccessToken, isLoggedIn } from "@/lib/auth";
import type { InvoicePreviewDocument } from "@/features/invoice-preview/types/invoice-preview.types";

export default function InvoiceV2DetailPage() {
  const router = useRouter();
  const params = useParams<{ userId: string; invoiceId: string }>();

  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const invoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;

  const [data, setData] = useState<InvoicePreviewDocument | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [assetAuthKey, setAssetAuthKey] = useState<string | null>(null);
  const [assetBearerToken, setAssetBearerToken] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    clearAccessToken({ sessionExpired: true });
    router.replace("/login");
  }, [router]);

  const loadInvoice = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.getInvoiceById(invoiceId);
      setData(mapWebpanelInvoiceToPreviewDocument(response));
    } catch (loadError) {
      if (isUnauthorizedError(loadError)) {
        handleUnauthorized();
        return;
      }

      if (loadError instanceof ApiError && loadError.status === 404) {
        setError("Invoice not found.");
      } else {
        setError(getErrorMessage(loadError, "Failed to load invoice preview."));
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, invoiceId, router]);

  const loadAssetAuthKey = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setAssetAuthKey(null);
      setAssetBearerToken(null);
      return;
    }
    setAssetBearerToken(token);

    try {
      const response = await fetch("/api/invoice-preview/asset-auth", {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setAssetAuthKey(null);
        return;
      }

      const payload = (await response.json()) as { key?: string };
      setAssetAuthKey(typeof payload.key === "string" ? payload.key : null);
    } catch {
      setAssetAuthKey(null);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadInvoice(), loadAssetAuthKey()]);
  }, [loadAssetAuthKey, loadInvoice]);

  return (
    <main className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar title="Invoice Preview V2" />
        <section className="content-wrap">
          <div className="section-header">
            <h2>Invoice ID: {invoiceId}</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link className="btn btn-outline" href={`/users/${userId}`}>
                Back to User
              </Link>
              <Link className="btn btn-outline" href={`/users/${userId}/invoices/${invoiceId}`}>
                Open Old Preview
              </Link>
            </div>
          </div>

          {isLoading ? <LoadingState message="Loading invoice preview..." /> : null}
          {!isLoading && error ? <ErrorState message={error} onRetry={loadInvoice} /> : null}
          {!isLoading && !error && !data ? <EmptyState message="No invoice data available." /> : null}
          {!isLoading && !error && data ? (
            <InvoicePreviewScreen
              data={data}
              pdfMode={false}
              assetAuthKey={assetAuthKey}
              assetBearerToken={assetBearerToken}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
