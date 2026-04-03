/* eslint-disable @next/next/no-img-element */
"use client";

import { useImageFailureState, usePreloadedImageFailure } from "@/features/invoice-preview/components/useInvoiceAssetLoadState";
import InvoiceHeader from "@/features/invoice-preview/components/InvoiceHeader";
import InvoiceItemsTable from "@/features/invoice-preview/components/InvoiceItemsTable";
import InvoiceSenderReceiver from "@/features/invoice-preview/components/InvoiceSenderReceiver";
import InvoiceTerms from "@/features/invoice-preview/components/InvoiceTerms";
import InvoiceTotals from "@/features/invoice-preview/components/InvoiceTotals";
import styles from "@/features/invoice-preview/styles/invoice-preview.module.css";
import type { InvoicePreviewDocument, InvoicePreviewLineItem } from "@/features/invoice-preview/types/invoice-preview.types";
import { resolveInvoiceAsset } from "@/lib/invoice-preview-assets";

interface InvoicePageProps {
  data: InvoicePreviewDocument;
  items: InvoicePreviewLineItem[];
  serialStart: number;
  showHeader: boolean;
  showSenderReceiver: boolean;
  showTotals: boolean;
  showTermsBottom: boolean;
  showOverlays: boolean;
  assetAuthKey?: string | null;
  minRows?: number;
}

const MIN_ITEM_ROWS = 9;

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
  assetAuthKey = null,
  minRows = MIN_ITEM_ROWS,
}: InvoicePageProps) {
  const watermark = getWatermark(data.invoice.invoiceStatus);
  const signatureOffset = data.invoice.signatureOffset || { x: 0.6, y: 0.65 };
  const stampOffset = data.invoice.stampOffset || { x: 0.81, y: 0.65 };
  const signatureScale = data.invoice.signatureScale || 0.168;
  const stampScale = data.invoice.stampScale || 0.168;
  const hasTerms = Boolean(showTermsBottom && data.template.showTerms && data.terms?.description?.trim());
  const signatureLeftX = Math.min(signatureOffset.x, 0.4);
  const stampLeftX = Math.min(stampOffset.x, 0.54);
  const backgroundImage = resolveInvoiceAsset(data.template.backgroundImageUrl, assetAuthKey);
  const signatureImage = resolveInvoiceAsset(data.signature?.imageUrl, assetAuthKey);
  const stampImage = resolveInvoiceAsset(data.stamp?.imageUrl, assetAuthKey);
  const backgroundImageFailed = usePreloadedImageFailure(backgroundImage.requestUrl, backgroundImage.kind === "resolved");
  const [signatureImageFailed, markSignatureImageFailed] = useImageFailureState(signatureImage.requestUrl);
  const [stampImageFailed, markStampImageFailed] = useImageFailureState(stampImage.requestUrl);

  return (
    <article className={styles.page} data-invoice-page="true">
      <div className={styles.pageInner}>
        {backgroundImage.kind === "resolved" && backgroundImage.requestUrl && !backgroundImageFailed ? (
          <div
            className={styles.pageBg}
            style={{
              backgroundImage: `url('${backgroundImage.requestUrl}')`,
              opacity: data.template.backgroundOpacity ?? 1,
            }}
          />
        ) : null}
        {backgroundImageFailed || backgroundImage.kind === "unsynced" ? (
          <span className={styles.unsyncedAssetBackgroundNotice}>Background image not synced</span>
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
              assetAuthKey={assetAuthKey}
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

        {showOverlays && signatureImage.kind === "resolved" && signatureImage.requestUrl && !signatureImageFailed ? (
          <img
            src={signatureImage.requestUrl}
            alt={data.signature?.name || "Signature"}
            className={styles.overlayAsset}
            onError={markSignatureImageFailed}
            style={{
              left: `${signatureLeftX * 100}%`,
              top: `calc(${signatureOffset.y * 100}% + 160px)`,
              width: `${signatureScale * 595.28}px`,
            }}
          />
        ) : null}
        {showOverlays && (signatureImageFailed || signatureImage.kind === "unsynced") ? (
          <span
            className={styles.overlayUnsyncedAsset}
            style={{
              left: `${signatureLeftX * 100}%`,
              top: `calc(${signatureOffset.y * 100}% + 160px)`,
              width: `${signatureScale * 595.28}px`,
            }}
          >
            Signature not synced
          </span>
        ) : null}

        {showOverlays && stampImage.kind === "resolved" && stampImage.requestUrl && !stampImageFailed ? (
          <img
            src={stampImage.requestUrl}
            alt={data.stamp?.name || "Stamp"}
            className={styles.overlayAsset}
            onError={markStampImageFailed}
            style={{
              left: `${stampLeftX * 100}%`,
              top: `calc(${stampOffset.y * 100}% + 160px)`,
              width: `${stampScale * 595.28}px`,
            }}
          />
        ) : null}
        {showOverlays && (stampImageFailed || stampImage.kind === "unsynced") ? (
          <span
            className={styles.overlayUnsyncedAsset}
            style={{
              left: `${stampLeftX * 100}%`,
              top: `calc(${stampOffset.y * 100}% + 160px)`,
              width: `${stampScale * 595.28}px`,
            }}
          >
            Stamp not synced
          </span>
        ) : null}
      </div>
    </article>
  );
}
