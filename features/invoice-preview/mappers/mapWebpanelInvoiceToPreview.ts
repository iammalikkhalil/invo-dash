import type { WebpanelInvoiceFullResponse } from "@/lib/types";
import type {
  DiscountType,
  InvoicePreviewDocument,
  InvoicePreviewOffset,
  InvoiceStatus,
} from "@/features/invoice-preview/types/invoice-preview.types";

const DEFAULT_TRANSLATIONS = {
  senderHeader: "From",
  receiverHeader: "To",
  title: "Invoice",
  metaHeader: "Invoice Details",
  invoiceNumberLabel: "Invoice #",
  issueDateLabel: "Issue Date",
  dueDateLabel: "Due Date",
  poNumberLabel: "P.O #",
  subtotalLabel: "Subtotal",
  discountLabel: "Discount",
  taxLabel: "Tax",
  shippingLabel: "Shipping",
  totalLabel: "Total",
  termsHeader: "Terms & Conditions",
  paymentHeader: "Payment Instructions",
  itemDescriptionHeader: "Description",
  itemQtyHeader: "Qty",
  itemPriceHeader: "Price",
  itemDiscountHeader: "Disc",
  itemTaxHeader: "Tax",
  itemAmountHeader: "Amount",
} as const;

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function normalizeDiscountType(value: string | null | undefined): DiscountType {
  if (value === "FLAT") return "FLAT";
  return "PERCENTAGE";
}

function normalizeInvoiceStatus(value: string | null | undefined): InvoiceStatus {
  switch ((value || "").toUpperCase()) {
    case "DRAFT":
      return "DRAFT";
    case "SENT":
      return "SENT";
    case "VIEWED":
      return "VIEWED";
    case "PARTIALLY_PAID":
    case "PARTIAL":
      return "PARTIAL";
    case "PAID":
      return "PAID";
    case "OVERDUE":
      return "OVERDUE";
    case "CANCELLED":
      return "CANCELLED";
    case "UNCOLLECTIBLE":
      return "UNCOLLECTIBLE";
    case "REFUNDED":
      return "REFUNDED";
    default:
      return "DRAFT";
  }
}

function parseOffset(raw: string | null | undefined): InvoicePreviewOffset | null {
  if (!raw?.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      const objectValue = parsed as Record<string, unknown>;
      const x = toNumber(objectValue.x as string | number | null | undefined, Number.NaN);
      const y = toNumber(objectValue.y as string | number | null | undefined, Number.NaN);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        return { x, y };
      }
    }
  } catch {
    // Continue to regex fallback.
  }

  const matches = raw.match(/-?\d+(\.\d+)?/g);
  if (!matches || matches.length < 2) return null;

  const x = toNumber(matches[0], Number.NaN);
  const y = toNumber(matches[1], Number.NaN);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function parsePaymentFields(fieldsJson: string | null | undefined): Record<string, string> {
  if (!fieldsJson?.trim()) return {};

  try {
    const parsed = JSON.parse(fieldsJson) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const entries = Object.entries(parsed as Record<string, unknown>);
    return entries.reduce<Record<string, string>>((acc, [key, value]) => {
      if (value === null || value === undefined) return acc;
      acc[key] = String(value);
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function resolveCurrencySymbol(currencyCode: string): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "narrowSymbol",
    });
    const parts = formatter.formatToParts(1);
    return parts.find((part) => part.type === "currency")?.value || currencyCode;
  } catch {
    return currencyCode;
  }
}

export function mapWebpanelInvoiceToPreviewDocument(
  data: WebpanelInvoiceFullResponse,
): InvoicePreviewDocument {
  const invoice = data.invoice;
  const client = data.client;
  const currencyCode = invoice.currency || client.currencyCode || "USD";

  const subtotal = toNumber(invoice.subtotal);
  const discountAmount = toNumber(invoice.discountAmount);
  const taxAmount = toNumber(invoice.taxAmount);
  const shippingCost = toNumber(invoice.shippingCost);
  const totalAmount = toNumber(invoice.totalAmount);
  const discountedSubtotal = subtotal - discountAmount;

  const lineItems = invoice.items.map((item, index) => ({
    id: item.id,
    invoiceId: invoice.id,
    productId: item.inventoryItemId,
    position: index + 1,
    quantity: toNumber(item.quantity),
    name: item.name,
    unitPrice: toNumber(item.unitPrice),
    netPrice: toNumber(item.netPrice),
    description: item.description,
    categoryId: null,
    unitTypeId: null,
    discountValue: item.discount !== null ? toNumber(item.discount) : null,
    discountType: item.discountType ? normalizeDiscountType(item.discountType) : null,
    taxId: invoice.taxId,
    dateCreated: null,
    dateUpdated: null,
    dateDeleted: null,
    isDeleted: false,
    isSynced: true,
    tax: data.tax
      ? {
          id: data.tax.id,
          name: data.tax.name,
          rate: toNumber(data.tax.rate),
        }
      : null,
    unitType: null,
    category: null,
  }));

  return {
    invoice: {
      id: invoice.id,
      customerId: invoice.clientId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      poNumber: invoice.poNumber,
      subtotal,
      discountAmount,
      taxAmount,
      shippingCost,
      totalAmount,
      invoiceStatus: normalizeInvoiceStatus(invoice.status),
      discountType: normalizeDiscountType(invoice.discountType),
      discountValue: toNumber(invoice.discountValue),
      taxId: invoice.taxId,
      termsId: invoice.termsId,
      paymentMethodId: invoice.paymentInstructionId,
      notes: invoice.notes,
      templateId: invoice.templateId,
      signatureId: invoice.signatureId,
      stampId: invoice.stampId,
      language: invoice.language,
      signatureOffset: parseOffset(invoice.signatureOffset),
      stampOffset: parseOffset(invoice.stampOffset),
      signatureScale: invoice.signatureScale ? toNumber(invoice.signatureScale) : null,
      stampScale: invoice.stampScale ? toNumber(invoice.stampScale) : null,
      dateCreated: invoice.createdAt,
      dateUpdated: invoice.updatedAt,
      dateSent: invoice.dateSent,
      dateDeleted: null,
      isDeleted: false,
      isSynced: true,
    },
    business: {
      id: client.businessId || data.template?.businessId || "00000000-0000-0000-0000-000000000000",
      name: "Business",
      shortName: null,
      logoUrl: null,
      licenseNumber: null,
      businessNumber: null,
      category: null,
      phone: null,
      email: null,
      website: null,
      addressLineOne: null,
      addressLineTwo: null,
      city: null,
      state: null,
      zipCode: null,
      country: null,
    },
    client: {
      id: client.id,
      businessId: client.businessId,
      fullName: client.name,
      email: client.emailAddress,
      phone: client.phone,
      addressLineOne: client.addressLine1,
      addressLineTwo: client.addressLine2,
      city: client.city,
      state: client.state,
      zipCode: client.zipcode,
      country: client.country,
      companyName: client.companyName,
      clientIdNumber: client.clientId,
      fax: client.faxNumber,
      currencyCode: client.currencyCode,
    },
    lineItems,
    discount: {
      type: normalizeDiscountType(invoice.discountType),
      value: toNumber(invoice.discountValue),
      amount: discountAmount,
    },
    tax: data.tax
      ? {
          id: data.tax.id,
          businessId: data.tax.businessId,
          name: data.tax.name,
          rate: toNumber(data.tax.rate),
          description: null,
          isSystemDefault: false,
          amount: taxAmount,
        }
      : null,
    totals: {
      subtotal,
      discountAmount,
      discountedSubtotal,
      taxAmount,
      shippingCost,
      total: totalAmount,
      totalPaid: 0,
      balanceDue: totalAmount,
    },
    currency: {
      code: currencyCode,
      symbol: resolveCurrencySymbol(currencyCode),
      name: currencyCode,
      countries: [],
      decimals: 2,
      isActive: true,
    },
    payments: [],
    paymentInstruction: data.paymentInstruction
      ? {
          id: data.paymentInstruction.id,
          method: "Payment Method",
          fields: parsePaymentFields(data.paymentInstruction.fieldsJson),
        }
      : null,
    terms: data.terms
      ? {
          id: data.terms.id,
          title: data.terms.title,
          description: data.terms.description,
        }
      : null,
    template: {
      id: data.template?.id || "00000000-0000-0000-0001-000000000001",
      templateStyle: data.template?.templateStyle ?? 1,
      templateName: data.template?.templateName || "Classic Professional",
      isSystemDefault: !Boolean(data.template?.isCustom),
      isCustom: Boolean(data.template?.isCustom),
      color: data.template?.color || "#DC2626",
      showBusinessLogo: true,
      showInvoiceMeta: true,
      showTitle: true,
      showSender: true,
      senderSoftWrapText: false,
      showReceiver: true,
      receiverSoftWrapText: false,
      showPayment: true,
      showTerms: true,
      showTotal: true,
      showItemTable: true,
      itemTableHeaderAlignment: "Left",
      itemTableBodyAlignment: "Left",
      headerBackground: {
        type:
          data.header?.backgroundType === "COLOR" ||
          data.header?.backgroundType === "THEME" ||
          data.header?.backgroundType === "IMAGE" ||
          data.header?.backgroundType === "NONE"
            ? data.header.backgroundType
            : "NONE",
        colorHex: data.header?.colorHex || null,
        themeType: data.header?.themeType || null,
        alpha:
          data.header?.themeAlpha === null || data.header?.themeAlpha === undefined
            ? null
            : toNumber(data.header.themeAlpha),
        overlayAlpha:
          data.header?.themeOverlayAlpha === null || data.header?.themeOverlayAlpha === undefined
            ? data.header?.imageOverlayAlpha === null || data.header?.imageOverlayAlpha === undefined
              ? null
              : toNumber(data.header.imageOverlayAlpha)
            : toNumber(data.header.themeOverlayAlpha),
        themeOverlayHex: data.header?.themeOverlayHex || null,
        imageOverlayHex: data.header?.imageOverlayHex || null,
        imageAlpha:
          data.header?.imageAlpha === null || data.header?.imageAlpha === undefined
            ? null
            : toNumber(data.header.imageAlpha),
        imageUrl: data.header?.image || null,
        imageScaleType:
          data.header?.imageScaleType === "CROP" ||
          data.header?.imageScaleType === "FIT" ||
          data.header?.imageScaleType === "STRETCH" ||
          data.header?.imageScaleType === "TILE"
            ? data.header.imageScaleType
            : null,
      },
      backgroundImageUrl: data.background?.image || null,
      backgroundOpacity: data.template?.backgroundOpacity ?? null,
    },
    signature: data.signature
      ? {
          id: data.signature.id,
          businessId: data.signature.businessId,
          name: data.signature.name,
          imageUrl: data.signature.image || null,
          description: null,
        }
      : null,
    stamp: data.stamp
      ? {
          id: data.stamp.id,
          businessId: data.stamp.businessId,
          name: data.stamp.name,
          imageUrl: data.stamp.image || null,
          description: data.stamp.description,
        }
      : null,
    translations: { ...DEFAULT_TRANSLATIONS },
  };
}
