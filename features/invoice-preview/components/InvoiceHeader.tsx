/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";
import styles from "@/features/invoice-preview/styles/invoice-preview.module.css";
import type { InvoicePreviewBusiness, InvoicePreviewInvoice, InvoicePreviewTemplate, InvoicePreviewTranslations } from "@/features/invoice-preview/types/invoice-preview.types";

interface InvoiceHeaderProps {
  invoice: InvoicePreviewInvoice;
  business: InvoicePreviewBusiness;
  template: InvoicePreviewTemplate;
  translations: InvoicePreviewTranslations;
}

function getHeaderStyle(template: InvoicePreviewTemplate): CSSProperties {
  const color = template.color || "#2563EB";
  const header = template.headerBackground;

  if (header.type === "COLOR" && header.colorHex) {
    return { background: header.colorHex, color: "#ffffff" };
  }

  if (header.type === "IMAGE" && header.imageUrl) {
    const overlay = Math.min(1, Math.max(0, header.overlayAlpha));
    return {
      backgroundImage: `linear-gradient(rgba(37,99,235,${overlay}), rgba(37,99,235,${overlay})), url('${header.imageUrl}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "#ffffff",
    };
  }

  return {
    background: `linear-gradient(140deg, ${color}, #1d4ed8)`,
    color: "#ffffff",
  };
}

export default function InvoiceHeader({ invoice, business, template, translations }: InvoiceHeaderProps) {
  void invoice;
  return (
    <section className={styles.header} style={getHeaderStyle(template)}>
      <div>
        {template.showBusinessLogo && business.logoUrl ? (
          <img src={business.logoUrl} alt="Business logo" className={styles.headerLogo} />
        ) : null}
      </div>
      {template.showTitle ? <h1 className={styles.headerTitle}>{translations.title}</h1> : null}
    </section>
  );
}
