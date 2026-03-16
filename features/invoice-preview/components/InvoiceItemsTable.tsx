import styles from "@/features/invoice-preview/styles/invoice-preview.module.css";
import type {
  InvoicePreviewCurrency,
  InvoicePreviewLineItem,
  InvoicePreviewTemplate,
  InvoicePreviewTranslations,
} from "@/features/invoice-preview/types/invoice-preview.types";

interface InvoiceItemsTableProps {
  items: InvoicePreviewLineItem[];
  currency: InvoicePreviewCurrency;
  template: InvoicePreviewTemplate;
  translations: InvoicePreviewTranslations;
  minRows?: number;
  serialStart?: number;
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

export default function InvoiceItemsTable({
  items,
  currency,
  template,
  translations,
  minRows = 9,
  serialStart = 1,
}: InvoiceItemsTableProps) {
  if (!template.showItemTable) return null;
  if (items.length === 0) return null;

  const displayRows: Array<InvoicePreviewLineItem | null> = [...items];
  while (displayRows.length < minRows) {
    displayRows.push(null);
  }

  const headerAlign = "left" as const;
  const bodyAlign = "left" as const;
  const amountAlign = "right" as const;
  const columnWidths = {
    serial: "6%",
    // Requested set was 98%; keep proportions and normalize to 100%.
    description: "36%",
    qty: "10%",
    price: "14%",
    discount: "10%",
    tax: "8%",
    amount: "16%",
  };

  return (
    <section className={styles.itemsWrap} data-invoice-items-wrap="true">
      <table className={styles.itemsTable} data-invoice-items-table="true">
        <thead data-invoice-items-head="true">
          <tr>
            <th style={{ width: columnWidths.serial, textAlign: headerAlign }}>S#</th>
            <th style={{ width: columnWidths.description, textAlign: headerAlign }}>{translations.itemDescriptionHeader}</th>
            <th style={{ width: columnWidths.qty, textAlign: headerAlign }}>{translations.itemQtyHeader}</th>
            <th style={{ width: columnWidths.price, textAlign: headerAlign }}>{translations.itemPriceHeader}</th>
            <th style={{ width: columnWidths.discount, textAlign: headerAlign }}>{translations.itemDiscountHeader}</th>
            <th style={{ width: columnWidths.tax, textAlign: headerAlign }}>{translations.itemTaxHeader}</th>
            <th style={{ width: columnWidths.amount, textAlign: amountAlign }}>{translations.itemAmountHeader}</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((item, index) => (
            <tr key={item?.id || `blank-${index}`}>
              <td style={{ textAlign: bodyAlign }}>{serialStart + index}</td>
              <td style={{ textAlign: bodyAlign }}>
                {item ? `${item.name}${item.description ? ` - ${item.description}` : ""}` : ""}
              </td>
              <td style={{ textAlign: bodyAlign }}>{item ? item.quantity.toFixed(2) : ""}</td>
              <td style={{ textAlign: bodyAlign }}>
                {item ? formatAmount(item.unitPrice, currency) : ""}
              </td>
              <td style={{ textAlign: bodyAlign }}>
                {item?.discountValue
                  ? item.discountType === "PERCENTAGE"
                    ? `${item.discountValue}%`
                    : formatAmount(item.discountValue, currency)
                  : ""}
              </td>
              <td style={{ textAlign: bodyAlign }}>{item?.tax ? `${item.tax.rate}%` : ""}</td>
              <td style={{ textAlign: amountAlign }}>{item ? formatAmount(item.netPrice, currency) : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
