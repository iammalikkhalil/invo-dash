import InvoicePreviewClientPage from "@/app/invoice-preview/InvoicePreviewClientPage";
import { dummyInvoice, InvoicePreviewScreen } from "@/features/invoice-preview";

interface InvoicePreviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InvoicePreviewPage({ searchParams }: InvoicePreviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const pdfParam = resolvedSearchParams.pdf;
  const pdfMode =
    typeof pdfParam === "string"
      ? pdfParam === "1"
      : Array.isArray(pdfParam)
        ? pdfParam.includes("1")
        : false;

  if (pdfMode) {
    return (
      <main className="invoice-pdf-page">
        <InvoicePreviewScreen data={dummyInvoice} pdfMode />
      </main>
    );
  }

  return <InvoicePreviewClientPage />;
}

