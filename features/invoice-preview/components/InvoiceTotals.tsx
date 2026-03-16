import styles from "@/features/invoice-preview/styles/invoice-preview.module.css";
import type {
  InvoicePreviewCurrency,
  InvoicePreviewTemplate,
  InvoicePreviewTotals,
  InvoicePreviewTranslations,
} from "@/features/invoice-preview/types/invoice-preview.types";

interface InvoiceTotalsProps {
  totals: InvoicePreviewTotals;
  currency: InvoicePreviewCurrency;
  template: InvoicePreviewTemplate;
  translations: InvoicePreviewTranslations;
}

function formatAmount(value: number, currency: InvoicePreviewCurrency): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: currency.decimals,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.code}`;
  }
}

export default function InvoiceTotals({ totals, currency, template, translations }: InvoiceTotalsProps) {
  if (!template.showTotal) return null;

  const showDiscount = totals.discountAmount > 0;
  const showTax = totals.taxAmount > 0;
  const showShipping = totals.shippingCost > 0;

  return (
    <article className={styles.totals}>
      <div className={styles.totalsRow}>
        <span>{translations.subtotalLabel}</span>
        <strong>{formatAmount(totals.subtotal, currency)}</strong>
      </div>
      {showDiscount ? (
        <div className={styles.totalsRow}>
          <span>{translations.discountLabel}</span>
          <strong>{formatAmount(totals.discountAmount, currency)}</strong>
        </div>
      ) : null}
      {showTax ? (
        <div className={styles.totalsRow}>
          <span>{translations.taxLabel}</span>
          <strong>{formatAmount(totals.taxAmount, currency)}</strong>
        </div>
      ) : null}
      {showShipping ? (
        <div className={styles.totalsRow}>
          <span>{translations.shippingLabel}</span>
          <strong>{formatAmount(totals.shippingCost, currency)}</strong>
        </div>
      ) : null}
      <div
        className={`${styles.totalsRow} ${styles.finalTotal}`}
        style={{ background: template.color || "#2563EB" }}
      >
        <span>{translations.totalLabel}</span>
        <strong>{formatAmount(totals.total, currency)}</strong>
      </div>
    </article>
  );
}
