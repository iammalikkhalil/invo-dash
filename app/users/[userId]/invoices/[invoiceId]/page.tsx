"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import InvoiceView from "@/components/InvoiceView";
import LoadingState from "@/components/LoadingState";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { api, ApiError, getErrorMessage, isUnauthorizedError } from "@/lib/api";
import { clearAccessToken, isLoggedIn } from "@/lib/auth";
import type { WebpanelInvoiceFullResponse } from "@/lib/types";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams<{ userId: string; invoiceId: string }>();

  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const invoiceId = Array.isArray(params.invoiceId) ? params.invoiceId[0] : params.invoiceId;

  const [data, setData] = useState<WebpanelInvoiceFullResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
      setData(response);
    } catch (loadError) {
      if (isUnauthorizedError(loadError)) {
        handleUnauthorized();
        return;
      }

      if (loadError instanceof ApiError && loadError.status === 404) {
        setError("Invoice not found.");
      } else {
        setError(getErrorMessage(loadError, "Failed to load invoice."));
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, invoiceId, router]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  return (
    <main className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar title="Invoice Detail" />
        <section className="content-wrap">
        <div className="section-header">
          <h2>Invoice ID: {invoiceId}</h2>
          <Link className="btn btn-outline" href={`/users/${userId}`}>
            Back to User
          </Link>
        </div>

        {isLoading ? <LoadingState message="Loading invoice..." /> : null}
        {!isLoading && error ? <ErrorState message={error} onRetry={loadInvoice} /> : null}
        {!isLoading && !error && !data ? <EmptyState message="No invoice data available." /> : null}
        {!isLoading && !error && data ? <InvoiceView data={data} /> : null}
        </section>
      </div>
    </main>
  );
}
