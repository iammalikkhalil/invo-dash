import { fallbackNumber, formatCurrency } from "@/lib/format";
import type { WebpanelUserStatsResponse } from "@/lib/types";

interface StatsCardsProps {
  stats: WebpanelUserStatsResponse;
}

function statusCount(source: Record<string, number>, keys: string[]): number {
  return keys.reduce((total, key) => total + fallbackNumber(source[key], 0), 0);
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const counts = stats.allTime?.counts;
  const totals = stats.allTime?.totals;
  const byStatus = counts?.invoicesByStatus ?? {};

  const totalInvoices = fallbackNumber(counts?.invoices, 0);
  const paidInvoices = statusCount(byStatus, ["PAID"]);
  const pendingInvoices = statusCount(byStatus, ["SENT", "DRAFT", "PENDING", "PARTIALLY_PAID", "PARTIAL"]);
  const overdueInvoices = statusCount(byStatus, ["OVERDUE"]);

  const totalRevenue = fallbackNumber(totals?.invoiceTotalAmount, 0);
  const paidRevenue = fallbackNumber(totals?.paymentTotalAmount, 0);
  const overdueRevenue = Math.max(totalRevenue - paidRevenue, 0);

  const cards = [
    { label: "Total Invoices", value: String(totalInvoices) },
    { label: "Paid Invoices", value: String(paidInvoices) },
    { label: "Pending Invoices", value: String(pendingInvoices) },
    { label: "Overdue Invoices", value: String(overdueInvoices) },
    { label: "Total Revenue", value: formatCurrency(totalRevenue) },
    { label: "Paid Revenue", value: formatCurrency(paidRevenue) },
    { label: "Overdue Revenue", value: formatCurrency(overdueRevenue) },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <article className="stat-card" key={card.label}>
          <p>{card.label}</p>
          <h3>{card.value}</h3>
        </article>
      ))}
    </div>
  );
}
