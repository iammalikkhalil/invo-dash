import type { WebpanelUserWithStatsResponse } from "@/lib/types";
import { fallbackNumber, fallbackText, formatCurrency, formatDate, formatDateTime } from "@/lib/format";

interface UserCardProps {
  user: WebpanelUserWithStatsResponse;
  onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  const allTime = user.stats?.allTime;
  const last30Days = user.stats?.last30Days;
  const allTimeCounts = allTime?.counts;
  const last30Counts = last30Days?.counts;
  const allTimeTotals = allTime?.totals;
  const overallLastActivityAt =
    allTime?.activity?.overallLastActivityAt ?? last30Days?.activity?.overallLastActivityAt;

  return (
    <button type="button" className="user-card" onClick={onClick}>
      <h3>{fallbackText(user.username, "No Username")}</h3>
      <p><strong>Email:</strong> {fallbackText(user.email)}</p>
      <p><strong>Phone:</strong> {fallbackText(user.phoneNumber)}</p>
      <p><strong>Role:</strong> {fallbackText(user.role)}</p>
      <p><strong>Status:</strong> {user.isActive ? "Active" : "Inactive"}</p>
      <p><strong>Created:</strong> {formatDate(user.createdAt)}</p>
      <p>
        <strong>All-time:</strong>{" "}
        {fallbackNumber(allTimeCounts?.invoices)} invoices,{" "}
        {fallbackNumber(allTimeCounts?.payments)} payments,{" "}
        {fallbackNumber(allTimeCounts?.expenses)} expenses
      </p>
      <p>
        <strong>Last 30d:</strong>{" "}
        {fallbackNumber(last30Counts?.invoices)} invoices,{" "}
        {fallbackNumber(last30Counts?.payments)} payments
      </p>
      <p>
        <strong>Invoice total:</strong>{" "}
        {formatCurrency(allTimeTotals?.invoiceTotalAmount, "USD")}
      </p>
      <p><strong>Last activity:</strong> {formatDateTime(overallLastActivityAt)}</p>
    </button>
  );
}
