import {
  fallbackNumber,
  fallbackText,
  formatCurrency,
  formatDateTime,
} from "@/lib/format";
import type {
  WebpanelUserCountsStats,
  WebpanelUserLastUpdatedAtStats,
  WebpanelUserStatsResponse,
} from "@/lib/types";

interface StatsCardsProps {
  stats: WebpanelUserStatsResponse;
}

const numberFormatter = new Intl.NumberFormat("en-US");

type NumericCountKey = Exclude<keyof WebpanelUserCountsStats, "invoicesByStatus">;

const countMetricConfig: Array<{ key: NumericCountKey; label: string }> = [
  { key: "businesses", label: "Businesses" },
  { key: "clients", label: "Clients" },
  { key: "invoices", label: "Invoices" },
  { key: "invoiceSynced", label: "Invoice Synced" },
  { key: "payments", label: "Payments" },
  { key: "expenses", label: "Expenses" },
  { key: "expenseSynced", label: "Expense Synced" },
  { key: "inventoryItems", label: "Inventory Items" },
  { key: "merchants", label: "Merchants" },
  { key: "templates", label: "Templates" },
  { key: "templatesSaved", label: "Templates Saved" },
  { key: "templatesCustom", label: "Templates Custom" },
  { key: "paymentInstructions", label: "Payment Instructions" },
  { key: "taxes", label: "Taxes" },
  { key: "terms", label: "Terms" },
  { key: "headers", label: "Headers" },
  { key: "backgrounds", label: "Backgrounds" },
  { key: "signatures", label: "Signatures" },
  { key: "stamps", label: "Stamps" },
  { key: "itemCategories", label: "Item Categories" },
  { key: "unitTypes", label: "Unit Types" },
];

const updatedAtConfig: Array<{ key: keyof WebpanelUserLastUpdatedAtStats; label: string }> = [
  { key: "businesses", label: "Businesses" },
  { key: "clients", label: "Clients" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "expenses", label: "Expenses" },
  { key: "inventoryItems", label: "Inventory Items" },
  { key: "merchants", label: "Merchants" },
  { key: "templates", label: "Templates" },
  { key: "paymentInstructions", label: "Payment Instructions" },
  { key: "taxes", label: "Taxes" },
  { key: "terms", label: "Terms" },
  { key: "headers", label: "Headers" },
  { key: "backgrounds", label: "Backgrounds" },
  { key: "signatures", label: "Signatures" },
  { key: "stamps", label: "Stamps" },
  { key: "itemCategories", label: "Item Categories" },
  { key: "unitTypes", label: "Unit Types" },
];

function formatInt(value: number): string {
  return numberFormatter.format(value);
}

function formatRate(value: number): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${value.toFixed(1)}%`;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const allTime = stats.allTime;
  const last30Days = stats.last30Days;

  const allCounts = allTime?.counts;
  const allTotals = allTime?.totals;
  const allByStatus = allCounts?.invoicesByStatus ?? {};

  const last30Counts = last30Days?.counts;
  const last30Totals = last30Days?.totals;
  const last30ByStatus = last30Counts?.invoicesByStatus ?? {};

  const allInvoices = fallbackNumber(allCounts?.invoices, 0);
  const allInvoiceSynced = fallbackNumber(allCounts?.invoiceSynced, 0);
  const allExpenses = fallbackNumber(allCounts?.expenses, 0);
  const allExpenseSynced = fallbackNumber(allCounts?.expenseSynced, 0);

  const allInvoiceTotal = fallbackNumber(allTotals?.invoiceTotalAmount, 0);
  const allPaymentTotal = fallbackNumber(allTotals?.paymentTotalAmount, 0);
  const allExpenseTotal = fallbackNumber(allTotals?.expenseTotalAmount, 0);

  const invoiceSyncRate = allInvoices > 0 ? (allInvoiceSynced / allInvoices) * 100 : 0;
  const expenseSyncRate = allExpenses > 0 ? (allExpenseSynced / allExpenses) * 100 : 0;
  const collectionRate = allInvoiceTotal > 0 ? (allPaymentTotal / allInvoiceTotal) * 100 : 0;

  const statusKeys = Array.from(
    new Set([...Object.keys(allByStatus), ...Object.keys(last30ByStatus)]),
  ).sort((a, b) => {
    const aTotal = fallbackNumber(allByStatus[a], 0) + fallbackNumber(last30ByStatus[a], 0);
    const bTotal = fallbackNumber(allByStatus[b], 0) + fallbackNumber(last30ByStatus[b], 0);
    return bTotal - aTotal;
  });

  const overviewCards = [
    { label: "Invoices (All-Time)", value: formatInt(allInvoices) },
    { label: "Invoices (Last 30d)", value: formatInt(fallbackNumber(last30Counts?.invoices, 0)) },
    { label: "Invoice Total", value: formatCurrency(allInvoiceTotal) },
    { label: "Payment Total", value: formatCurrency(allPaymentTotal) },
    { label: "Expense Total", value: formatCurrency(allExpenseTotal) },
    { label: "Collection Rate", value: formatRate(collectionRate) },
    { label: "Invoice Sync Rate", value: formatRate(invoiceSyncRate) },
    { label: "Expense Sync Rate", value: formatRate(expenseSyncRate) },
    { label: "Last Login", value: formatDateTime(stats.lastLoginAt) },
    {
      label: "Last Activity",
      value: formatDateTime(
        allTime?.activity?.overallLastActivityAt ?? last30Days?.activity?.overallLastActivityAt,
      ),
    },
  ];

  const comparisonRows = [
    {
      label: "Businesses",
      all: fallbackNumber(allCounts?.businesses, 0),
      last30: fallbackNumber(last30Counts?.businesses, 0),
      format: formatInt,
    },
    {
      label: "Clients",
      all: fallbackNumber(allCounts?.clients, 0),
      last30: fallbackNumber(last30Counts?.clients, 0),
      format: formatInt,
    },
    {
      label: "Invoices",
      all: allInvoices,
      last30: fallbackNumber(last30Counts?.invoices, 0),
      format: formatInt,
    },
    {
      label: "Payments",
      all: fallbackNumber(allCounts?.payments, 0),
      last30: fallbackNumber(last30Counts?.payments, 0),
      format: formatInt,
    },
    {
      label: "Expenses",
      all: allExpenses,
      last30: fallbackNumber(last30Counts?.expenses, 0),
      format: formatInt,
    },
    {
      label: "Invoice Total",
      all: allInvoiceTotal,
      last30: fallbackNumber(last30Totals?.invoiceTotalAmount, 0),
      format: (value: number) => formatCurrency(value),
    },
    {
      label: "Payment Total",
      all: allPaymentTotal,
      last30: fallbackNumber(last30Totals?.paymentTotalAmount, 0),
      format: (value: number) => formatCurrency(value),
    },
    {
      label: "Expense Total",
      all: allExpenseTotal,
      last30: fallbackNumber(last30Totals?.expenseTotalAmount, 0),
      format: (value: number) => formatCurrency(value),
    },
  ];

  return (
    <div className="stats-dashboard">
      <section className="stats-block">
        <div className="stats-block-head">
          <h3>Overview</h3>
          <p>Primary performance and sync indicators</p>
        </div>
        <div className="stats-kpi-grid">
          {overviewCards.map((card) => (
            <article key={card.label} className="stats-kpi-card">
              <p>{card.label}</p>
              <h4>{card.value}</h4>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-block">
        <div className="stats-block-head">
          <h3>Period Comparison</h3>
          <p>All-time vs last 30 days</p>
        </div>
        <div className="stats-compare-wrap">
          <div className="stats-compare-head">
            <span>Metric</span>
            <span>All-Time</span>
            <span>Last 30d</span>
          </div>
          {comparisonRows.map((row) => (
            <div key={row.label} className="stats-compare-row">
              <span>{row.label}</span>
              <span>{row.format(row.all)}</span>
              <span>{row.format(row.last30)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-block">
        <div className="stats-block-head">
          <h3>Entity Counts</h3>
          <p>Complete object-level count coverage</p>
        </div>
        <div className="entity-stats-grid">
          {countMetricConfig.map((metric) => {
            const all = fallbackNumber(allCounts?.[metric.key], 0);
            const last30 = fallbackNumber(last30Counts?.[metric.key], 0);
            const share = all > 0 ? (last30 / all) * 100 : 0;

            return (
              <article key={metric.key} className="entity-stat-card">
                <p>{metric.label}</p>
                <h4>{formatInt(all)}</h4>
                <div className="entity-stat-foot">
                  <span>30d: {formatInt(last30)}</span>
                  <span>{formatRate(share)} of all-time</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="stats-block">
        <div className="stats-block-head">
          <h3>Invoice Status Breakdown</h3>
          <p>Status distribution for all-time and last 30 days</p>
        </div>
        {statusKeys.length === 0 ? (
          <p className="muted-line">No invoice status data available.</p>
        ) : (
          <div className="stats-compare-wrap">
            <div className="stats-compare-head">
              <span>Status</span>
              <span>All-Time</span>
              <span>Last 30d</span>
            </div>
            {statusKeys.map((status) => (
              <div key={status} className="stats-compare-row">
                <span>{fallbackText(status)}</span>
                <span>{formatInt(fallbackNumber(allByStatus[status], 0))}</span>
                <span>{formatInt(fallbackNumber(last30ByStatus[status], 0))}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stats-block">
        <div className="stats-block-head">
          <h3>Last Updated Timeline</h3>
          <p>Per-entity latest update timestamps</p>
        </div>
        <div className="updated-grid">
          {updatedAtConfig.map((item) => (
            <article key={item.key} className="updated-card">
              <p>{item.label}</p>
              <div className="updated-values">
                <span>
                  Updated:{" "}
                  {formatDateTime(
                    allTime?.lastUpdatedAt?.[item.key] ?? last30Days?.lastUpdatedAt?.[item.key],
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
