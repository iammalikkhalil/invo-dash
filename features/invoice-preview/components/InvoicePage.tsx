/* eslint-disable @next/next/no-img-element */

import InvoiceHeader from "@/features/invoice-preview/components/InvoiceHeader";
import InvoiceItemsTable from "@/features/invoice-preview/components/InvoiceItemsTable";
import InvoiceSenderReceiver from "@/features/invoice-preview/components/InvoiceSenderReceiver";
import InvoiceTerms from "@/features/invoice-preview/components/InvoiceTerms";
import InvoiceTotals from "@/features/invoice-preview/components/InvoiceTotals";
import styles from "@/features/invoice-preview/styles/invoice-preview.module.css";
import type { InvoicePreviewDocument, InvoicePreviewLineItem } from "@/features/invoice-preview/types/invoice-preview.types";

interface InvoicePageProps {
  data: InvoicePreviewDocument;
  items: InvoicePreviewLineItem[];
  serialStart: number;
  showHeader: boolean;
  showSenderReceiver: boolean;
  showTotals: boolean;
  showTermsBottom: boolean;
  showOverlays: boolean;
  minRows?: number;
}

function getWatermark(invoiceStatus: string): { text: string; color: string } | null {
  if (invoiceStatus === "DRAFT") return { text: "DRAFT", color: "#6b7280" };
  if (invoiceStatus === "PAID") return { text: "PAID", color: "#16a34a" };
  if (invoiceStatus === "OVERDUE") return { text: "OVERDUE", color: "#dc2626" };
  return null;
}

export default function InvoicePage({
  data,
  items,
  serialStart,
  showHeader,
  showSenderReceiver,
  showTotals,
  showTermsBottom,
  showOverlays,
  minRows = 9,
}: InvoicePageProps) {
  const watermark = getWatermark(data.invoice.invoiceStatus);
  const signatureOffset = data.invoice.signatureOffset || { x: 0.6, y: 0.65 };
  const stampOffset = data.invoice.stampOffset || { x: 0.81, y: 0.65 };
  const signatureScale = data.invoice.signatureScale || 0.168;
  const stampScale = data.invoice.stampScale || 0.168;
  const hasTerms = Boolean(showTermsBottom && data.template.showTerms && data.terms?.description?.trim());
  const signatureLeftX = Math.min(signatureOffset.x, 0.4);
  const stampLeftX = Math.min(stampOffset.x, 0.54);

  return (
    <article className={styles.page} data-invoice-page="true">
      <div className={styles.pageInner}>
        {data.template.backgroundImageUrl ? (
          <div
            className={styles.pageBg}
            style={{
              backgroundImage: `url('${data.template.backgroundImageUrl}')`,
              opacity: data.template.backgroundOpacity ?? 1,
            }}
          />
        ) : null}

        {watermark ? (
          <span className={styles.watermark} style={{ color: watermark.color }}>
            {watermark.text}
          </span>
        ) : null}

        <div
          className={`${styles.content} ${hasTerms ? styles.contentWithBottomTerms : ""}`}
          data-invoice-content="true"
        >
          {showHeader ? (
            <InvoiceHeader
              invoice={data.invoice}
              business={data.business}
              template={data.template}
              translations={data.translations}
            />
          ) : null}

          {showSenderReceiver ? (
            <InvoiceSenderReceiver
              business={data.business}
              client={data.client}
              invoice={data.invoice}
              template={data.template}
              translations={data.translations}
            />
          ) : null}

          <InvoiceItemsTable
            items={items}
            currency={data.currency}
            template={data.template}
            translations={data.translations}
            minRows={minRows}
            serialStart={serialStart}
          />

          {!showTotals ? <div className={styles.itemsBottomSpacer} data-invoice-items-spacer="true" /> : null}

          {showTotals ? (
            <section className={styles.totalsUnderItems} data-invoice-totals-wrap="true">
              <InvoiceTotals
                totals={data.totals}
                currency={data.currency}
                template={data.template}
                translations={data.translations}
              />
            </section>
          ) : null}
        </div>

        {hasTerms ? (
          <section className={styles.termsBottom}>
            <InvoiceTerms
              terms={data.terms}
              template={data.template}
              translations={data.translations}
            />
          </section>
        ) : null}

        {showOverlays && data.signature?.imageUrl ? (
          <img
            src={data.signature.imageUrl}
            alt={data.signature.name}
            className={styles.overlayAsset}
            style={{
              left: `${signatureLeftX * 100}%`,
              top: `calc(${signatureOffset.y * 100}% + 160px)`,
              width: `${signatureScale * 595.28}px`,
            }}
          />
        ) : null}

        {showOverlays && data.stamp?.imageUrl ? (
          <img
            src={data.stamp.imageUrl}
            alt={data.stamp.name}
            className={styles.overlayAsset}
            style={{
              left: `${stampLeftX * 100}%`,
              top: `calc(${stampOffset.y * 100}% + 160px)`,
              width: `${stampScale * 595.28}px`,
            }}
          />
        ) : null}
      </div>
    </article>
  );
}
