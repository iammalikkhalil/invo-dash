import styles from "@/features/invoice-preview/styles/invoice-preview.module.css";
import type {
  InvoicePreviewBusiness,
  InvoicePreviewClient,
  InvoicePreviewInvoice,
  InvoicePreviewTemplate,
  InvoicePreviewTranslations,
} from "@/features/invoice-preview/types/invoice-preview.types";
import { formatDate } from "@/lib/format";

interface InvoiceSenderReceiverProps {
  business: InvoicePreviewBusiness;
  client: InvoicePreviewClient | null;
  invoice: InvoicePreviewInvoice;
  template: InvoicePreviewTemplate;
  translations: InvoicePreviewTranslations;
}

function compactAddress(input: Array<string | null | undefined>): string | null {
  const value = input
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(", ");
  return value || null;
}

export default function InvoiceSenderReceiver({
  business,
  client,
  invoice,
  template,
  translations,
}: InvoiceSenderReceiverProps) {
  const senderAddress = compactAddress([
    business.addressLineOne,
    business.addressLineTwo,
    compactAddress([business.city, business.state]),
    compactAddress([business.zipCode, business.country]),
  ]);

  const receiverAddress = compactAddress([
    client?.addressLineOne,
    client?.addressLineTwo,
    compactAddress([client?.city, client?.state]),
    compactAddress([client?.zipCode, client?.country]),
  ]);

  return (
    <section className={styles.rowThree}>
      {template.showSender ? (
        <article className={styles.block}>
          <h3 className={styles.blockHeader}>{translations.senderHeader}</h3>
          <p className={styles.blockText}>{business.name}</p>
          {senderAddress ? <p className={styles.blockText}>{senderAddress}</p> : null}
          {business.phone ? <p className={styles.blockText}>Phone: {business.phone}</p> : null}
          {business.email ? <p className={styles.blockText}>Email: {business.email}</p> : null}
        </article>
      ) : (
        <div />
      )}

      {template.showReceiver ? (
        <article className={styles.block}>
          <h3 className={styles.blockHeader}>{translations.receiverHeader}</h3>
          <p className={styles.blockText}>{client?.fullName || "-"}</p>
          {client?.companyName ? <p className={styles.blockText}>{client.companyName}</p> : null}
          {receiverAddress ? <p className={styles.blockText}>{receiverAddress}</p> : null}
          {client?.phone ? <p className={styles.blockText}>Phone: {client.phone}</p> : null}
          {client?.email ? <p className={styles.blockText}>Email: {client.email}</p> : null}
        </article>
      ) : (
        <div />
      )}

      {template.showInvoiceMeta ? (
        <article className={`${styles.block} ${styles.metaBlock}`}>
          <h3 className={styles.blockHeader}>{translations.metaHeader}</h3>
          <p className={styles.blockText}>
            {translations.invoiceNumberLabel}: {invoice.invoiceNumber}
          </p>
          <p className={styles.blockText}>
            {translations.issueDateLabel}: {formatDate(invoice.invoiceDate)}
          </p>
          <p className={styles.blockText}>
            {translations.dueDateLabel}: {formatDate(invoice.dueDate)}
          </p>
          {invoice.poNumber ? (
            <p className={styles.blockText}>
              {translations.poNumberLabel}: {invoice.poNumber}
            </p>
          ) : null}
        </article>
      ) : (
        <div />
      )}
    </section>
  );
}
