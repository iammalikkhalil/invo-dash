# Invoice Preview Pixel-Parity Plan (Dummy Data Only)

Last Updated: 2026-03-13

## Hard Rules
- Data source is one hardcoded dummy invoice object.
- No API, no fetch, no adapter mapping.
- Existing invoice route and `components/InvoiceView.tsx` remain untouched.
- New feature is isolated under `/invoice-preview`.

## Phase Tracker

| Phase | Name | Status | Progress |
|---|---|---:|---:|
| P0 | Remove wrong API-driven implementation | done | 1/1 |
| P1 | Add complete TypeScript invoice model | done | 1/1 |
| P2 | Add realistic dummy invoice object | done | 1/1 |
| P3 | Build invoice preview component architecture | done | 1/1 |
| P4 | Add A4 canvas + screen scaling + print behavior | done | 1/1 |
| P5 | Add new route + sidebar entry | done | 1/1 |
| P6 | Validation (lint/build + non-regression check) | done | 1/1 |

## Implemented Structure

```text
app/
  invoice-preview/
    page.tsx

features/
  invoice-preview/
    components/
      InvoicePreviewScreen.tsx
      InvoicePage.tsx
      InvoiceHeader.tsx
      InvoiceSenderReceiver.tsx
      InvoiceItemsTable.tsx
      InvoiceTotals.tsx
      InvoicePaymentInstructions.tsx
      InvoiceTerms.tsx
    data/
      dummyInvoice.ts
    styles/
      invoice-preview.module.css
    types/
      invoice-preview.types.ts
    index.ts
```

## Non-Regression Confirmation
- Existing file untouched:
  - `app/users/[userId]/invoices/[invoiceId]/page.tsx`
  - `components/InvoiceView.tsx`

## Notes
- Typography and spacing follow phase1 ratio targets using 595x842 A4 baseline.
- Item table keeps minimum 9 visual rows.
- Conditional rendering includes discount/tax/shipping/terms/payment/notes and status watermark rules.
