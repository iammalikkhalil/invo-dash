"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import InvoiceTable from "@/components/InvoiceTable";
import LoadingState from "@/components/LoadingState";
import Navbar from "@/components/Navbar";
import StatsCards from "@/components/StatsCards";
import { api, getErrorMessage, isUnauthorizedError } from "@/lib/api";
import { clearAccessToken, isLoggedIn } from "@/lib/auth";
import type { WebpanelInvoiceSummaryResponse, WebpanelUserStatsResponse } from "@/lib/types";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;

  const [stats, setStats] = useState<WebpanelUserStatsResponse | null>(null);
  const [invoices, setInvoices] = useState<WebpanelInvoiceSummaryResponse[]>([]);

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(true);

  const [statsError, setStatsError] = useState("");
  const [invoicesError, setInvoicesError] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAccessToken({ sessionExpired: true });
    router.replace("/login");
  }, [router]);

  const loadStats = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    setIsStatsLoading(true);
    setStatsError("");

    try {
      const response = await api.getUserStats(userId);
      setStats(response);
    } catch (statsLoadError) {
      if (isUnauthorizedError(statsLoadError)) {
        handleUnauthorized();
        return;
      }

      setStatsError(getErrorMessage(statsLoadError, "Failed to load user stats."));
    } finally {
      setIsStatsLoading(false);
    }
  }, [handleUnauthorized, router, userId]);

  const loadInvoices = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    setIsInvoicesLoading(true);
    setInvoicesError("");

    try {
      const response = await api.getInvoices(userId);
      setInvoices(response ?? []);
    } catch (invoicesLoadError) {
      if (isUnauthorizedError(invoicesLoadError)) {
        handleUnauthorized();
        return;
      }

      setInvoicesError(getErrorMessage(invoicesLoadError, "Failed to load invoices."));
    } finally {
      setIsInvoicesLoading(false);
    }
  }, [handleUnauthorized, router, userId]);

  useEffect(() => {
    void Promise.all([loadStats(), loadInvoices()]);
  }, [loadInvoices, loadStats]);

  return (
    <main className="page-wrap">
      <Navbar title="User Detail" />
      <section className="content-wrap">
        <div className="section-header">
          <h2>User ID: {userId}</h2>
          <Link className="btn btn-outline" href="/users">
            Back to Users
          </Link>
        </div>

        <section className="section-card">
          <h2>User Stats</h2>
          {isStatsLoading ? <LoadingState message="Loading stats..." /> : null}
          {!isStatsLoading && statsError ? (
            <ErrorState message={statsError} onRetry={loadStats} />
          ) : null}
          {!isStatsLoading && !statsError && !stats ? (
            <EmptyState message="No stats available." />
          ) : null}
          {!isStatsLoading && !statsError && stats ? <StatsCards stats={stats} /> : null}
        </section>

        {isInvoicesLoading ? <LoadingState message="Loading invoices..." /> : null}
        {!isInvoicesLoading && invoicesError ? (
          <ErrorState message={invoicesError} onRetry={loadInvoices} />
        ) : null}
        {!isInvoicesLoading && !invoicesError ? (
          <InvoiceTable
            invoices={invoices}
            onSelect={(invoiceId) => router.push(`/users/${userId}/invoices/${invoiceId}`)}
          />
        ) : null}
      </section>
    </main>
  );
}
