"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { dummyInvoice, InvoicePreviewScreen } from "@/features/invoice-preview";
import { isLoggedIn } from "@/lib/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoicePreviewClientPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar title="Invoice Preview" />
        <section className="content-wrap">
          <InvoicePreviewScreen data={dummyInvoice} pdfMode={false} />
        </section>
      </div>
    </main>
  );
}

