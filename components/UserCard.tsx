import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

interface UserCardProps {
  row: {
    email: string;
    role: string;
    invoicesAll: number;
    invoices30: number;
    overdue: number;
    paymentsAll: number;
    expensesAll: number;
    invoiceTotalAll: number;
    lastActivityAt: string | null;
    createdAt: string | null;
  };
  onClick: () => void;
}

function compactEmail(email: string, maxLength = 24): string {
  if (email.length <= maxLength) {
    return email;
  }

  const atIndex = email.indexOf("@");
  if (atIndex <= 1) {
    return `${email.slice(0, maxLength - 1)}...`;
  }

  const domain = email.slice(atIndex);
  const localLength = Math.max(4, maxLength - domain.length - 3);
  return `${email.slice(0, localLength)}...${domain}`;
}

export default function UserCard({ row, onClick }: UserCardProps) {
  return (
    <button type="button" className="users-table-row" onClick={onClick}>
      <span className="users-cell users-cell-email" title={row.email}>
        {compactEmail(row.email)}
      </span>
      <span className="users-cell">{row.role}</span>
      <span className="users-cell users-cell-number">{row.invoicesAll}</span>
      <span className="users-cell users-cell-number">{row.invoices30}</span>
      <span className="users-cell users-cell-number">{row.overdue}</span>
      <span className="users-cell users-cell-number">{row.paymentsAll}</span>
      <span className="users-cell users-cell-number">{row.expensesAll}</span>
      <span className="users-cell">{formatCurrency(row.invoiceTotalAll, "USD")}</span>
      <span className="users-cell">{formatDateTime(row.lastActivityAt)}</span>
      <span className="users-cell">{formatDate(row.createdAt)}</span>
    </button>
  );
}
