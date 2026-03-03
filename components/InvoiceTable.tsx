"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { filterByQuery } from "@/lib/search";
import { fallbackText, formatCurrency, formatDate } from "@/lib/format";
import type { WebpanelInvoiceSummaryResponse } from "@/lib/types";

interface InvoiceTableProps {
  invoices: WebpanelInvoiceSummaryResponse[];
  onSelect: (invoiceId: string) => void;
}

export default function InvoiceTable({ invoices, onSelect }: InvoiceTableProps) {
  const [query, setQuery] = useState("");

  const filteredInvoices = useMemo(
    () => filterByQuery(invoices, query),
    [invoices, query],
  );

  return (
    <section className="section-card">
      <h2>Invoices</h2>
      <SearchBar
        value={query}
        onChange={setQuery}
        label="Search Invoices"
        placeholder="Search invoices by any field"
      />
      {filteredInvoices.length === 0 ? (
        <EmptyState message={query ? "No invoices match your search." : "No invoices found."} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Client Name</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Total Amount</th>
                <th>Currency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} onClick={() => onSelect(invoice.id)} className="click-row">
                  <td>{fallbackText(invoice.invoiceNumber)}</td>
                  <td>{fallbackText(invoice.clientName)}</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td>{formatCurrency(invoice.totalAmount, invoice.currency)}</td>
                  <td>{fallbackText(invoice.currency)}</td>
                  <td>{fallbackText(invoice.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
