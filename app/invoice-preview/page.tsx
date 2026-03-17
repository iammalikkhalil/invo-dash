import InvoicePreviewClientPage from "@/app/invoice-preview/InvoicePreviewClientPage";
import { dummyInvoice, InvoicePreviewScreen } from "@/features/invoice-preview";
import { consumeInvoicePreviewPayload } from "@/lib/invoice-preview-payload-store";

interface InvoicePreviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InvoicePreviewPage({ searchParams }: InvoicePreviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const pdfParam = resolvedSearchParams.pdf;
  const payloadKeyParam = resolvedSearchParams.payloadKey;
  const assetAuthKeyParam = resolvedSearchParams.assetAuthKey;
  const pdfMode =
    typeof pdfParam === "string"
      ? pdfParam === "1"
      : Array.isArray(pdfParam)
        ? pdfParam.includes("1")
        : false;
  const payloadKey =
    typeof payloadKeyParam === "string"
      ? payloadKeyParam
      : Array.isArray(payloadKeyParam)
        ? payloadKeyParam[0] || null
        : null;
  const assetAuthKey =
    typeof assetAuthKeyParam === "string"
      ? assetAuthKeyParam
      : Array.isArray(assetAuthKeyParam)
        ? assetAuthKeyParam[0] || null
        : null;

  if (pdfMode) {
    const payloadData = consumeInvoicePreviewPayload(payloadKey);
    return (
      <main className="invoice-pdf-page">
        <InvoicePreviewScreen data={payloadData || dummyInvoice} pdfMode assetAuthKey={assetAuthKey} />
      </main>
    );
  }

  return <InvoicePreviewClientPage />;
}
