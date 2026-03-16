═══════════════════════════════════════
PHASE 2 — API CONTRACT
═══════════════════════════════════════
GET /api/invoices/:id — Complete Response Schema

{
  "invoice": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "invoice_number": "INV-2026-03-001",
    "invoice_date": "2026-03-12T00:00:00Z",
    "due_date": "2026-03-19T00:00:00Z",
    "po_number": "PO-12345",
    "status": "DRAFT",
    "language": "en",
    "notes": "Thank you for your business",
    "date_created": "2026-03-12T10:30:00Z",
    "date_updated": "2026-03-12T10:30:00Z",
    "date_sent": null,
    "is_deleted": false
  },

  "business": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corp",
    "short_name": "Acme",
    "logo_url": "https://api.invotick.com/uploads/logos/660e8400.png",
    "license_number": "LLC-12345",
    "business_number": "BN-67890",
    "category": "Technology",
    "phone": "+1-555-0100",
    "email": "billing@acme.com",
    "website": "https://acme.com",
    "address_line_one": "123 Business St",
    "address_line_two": "Suite 100",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94105",
    "country": "United States"
  },

  "client": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Smith",
    "company_name": "Smith Industries",
    "email": "john@smith.com",
    "phone": "+1-555-0200",
    "address_line_one": "456 Client Ave",
    "address_line_two": null,
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90001",
    "country": "United States",
    "client_id_number": "CL-001",
    "fax": null
  },

  "line_items": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "position": 1,
      "name": "Web Development",
      "description": "Full-stack web application development",
      "quantity": "10.00",
      "unit_price": "150.00",
      "net_price": "142.50",
      "discount_value": "5.00",
      "discount_type": "PERCENTAGE",
      "tax": {
        "id": "aa0e8400-e29b-41d4-a716-446655440000",
        "name": "State Tax",
        "rate": "8.50"
      },
      "unit_type": {
        "id": "bb0e8400-e29b-41d4-a716-446655440000",
        "name": "hours"
      },
      "category": {
        "id": "cc0e8400-e29b-41d4-a716-446655440000",
        "name": "Services"
      }
    }
  ],

  "discount": {
    "type": "PERCENTAGE",
    "value": "10.00",
    "amount": "142.50"
  },

  "tax": {
    "id": "dd0e8400-e29b-41d4-a716-446655440000",
    "name": "Sales Tax",
    "rate": "8.00",
    "amount": "102.60"
  },

  "totals": {
    "subtotal": "1425.00",
    "discount_amount": "142.50",
    "discounted_subtotal": "1282.50",
    "tax_amount": "102.60",
    "shipping_cost": "25.00",
    "total": "1410.10",
    "total_paid": "500.00",
    "balance_due": "910.10"
  },

  "currency": {
    "code": "USD",
    "symbol": "$",
    "name": "US Dollar",
    "decimals": 2
  },

  "payments": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440000",
      "payment_id": "ff0e8400-e29b-41d4-a716-446655440000",
      "amount_applied": "500.00",
      "applied_date": "2026-03-10T00:00:00Z",
      "payment_number": "PAY-001",
      "reference_number": "REF-123"
    }
  ],

  "payment_instructions": {
    "id": "110e8400-e29b-41d4-a716-446655440000",
    "method": "Bank Transfer",
    "fields": {
      "Bank Name": "Chase Bank",
      "Account Number": "****1234",
      "Routing Number": "021000021",
      "SWIFT": "CHASUS33"
    }
  },

  "terms": {
    "id": "220e8400-e29b-41d4-a716-446655440000",
    "title": "Payment Terms",
    "description": "Payment is due within 7 days of invoice date. Late payments will incur a 1.5% monthly interest charge."
  },

  "template": {
    "id": "00000000-0000-0000-0001-000000000001",
    "template_style": 1,
    "template_name": "Classic Professional",
    "is_system_default": true,
    "is_custom": false,
    "color": "#0D4DC0",
    "show_business_logo": true,
    "show_invoice_meta": true,
    "show_title": true,
    "show_sender": true,
    "sender_soft_wrap_text": false,
    "show_receiver": true,
    "receiver_soft_wrap_text": false,
    "show_payment": true,
    "show_terms": true,
    "show_total": true,
    "show_item_table": true,
    "item_table_header_alignment": "Left",
    "item_table_body_alignment": "Left",
    "header_background": {
      "type": "THEME",
      "theme_type": "PRIMARY_VARIANT",
      "alpha": 1.0,
      "overlay_alpha": 0.25,
      "image_url": null,
      "image_scale_type": null,
      "color_hex": null
    },
    "background": null,
    "background_opacity": null
  },

  "signature": {
    "id": "330e8400-e29b-41d4-a716-446655440000",
    "name": "CEO Signature",
    "image_url": "https://api.invotick.com/uploads/signatures/330e8400.png",
    "offset_x": 0.60,
    "offset_y": 0.65,
    "scale": 0.168
  },

  "stamp": {
    "id": "440e8400-e29b-41d4-a716-446655440000",
    "name": "Company Stamp",
    "image_url": "https://api.invotick.com/uploads/stamps/440e8400.png",
    "offset_x": 0.81,
    "offset_y": 0.65,
    "scale": 0.168
  },

  "translations": {
    "sender_header": "From",
    "receiver_header": "To",
    "title": "Invoice",
    "meta_header": "Invoice Details",
    "invoice_number_label": "Invoice #",
    "issue_date_label": "Issue Date",
    "due_date_label": "Due Date",
    "po_number_label": "P.O #",
    "subtotal_label": "Subtotal",
    "discount_label": "Discount",
    "tax_label": "Tax",
    "shipping_label": "Shipping",
    "total_label": "Total",
    "terms_header": "Terms & Conditions",
    "payment_header": "Payment Instructions",
    "item_description_header": "Description",
    "item_qty_header": "Qty",
    "item_price_header": "Price",
    "item_discount_header": "Disc",
    "item_tax_header": "Tax",
    "item_amount_header": "Amount"
  }
}
Field-by-Field Documentation
invoice object (required)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Unique invoice identifier
invoice_number	string	Yes	No	Display invoice number (e.g., "INV-2026-03-001")
invoice_date	string (ISO 8601)	Yes	No	Invoice issue date
due_date	string (ISO 8601)	Yes	No	Payment due date
po_number	string	No	Yes	Purchase order reference
status	string (enum)	Yes	No	DRAFT, SENT, VIEWED, PARTIAL, PAID, OVERDUE, CANCELLED, UNCOLLECTIBLE, REFUNDED
language	string	No	Yes	ISO language code for translations
notes	string	No	Yes	Customer-facing notes (NOT rendered in PDF currently)
date_created	string (ISO 8601)	Yes	No	Creation timestamp
date_updated	string (ISO 8601)	Yes	No	Last update timestamp
date_sent	string (ISO 8601)	No	Yes	When invoice was sent/posted
is_deleted	boolean	Yes	No	Soft delete flag
business object (required)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Business identifier
name	string	Yes	No	Business display name (rendered as sender name)
short_name	string	No	Yes	Short business name
logo_url	string (URL)	No	Yes	URL to business logo image
license_number	string	No	Yes	Business license number
business_number	string	No	Yes	Business registration number
category	string	No	Yes	Business category/type
phone	string	No	Yes	Rendered in sender "Phone:" line
email	string	No	Yes	Rendered in sender "Email:" line
website	string	No	Yes	Business website
address_line_one	string	No	Yes	Street address line 1
address_line_two	string	No	Yes	Street address line 2
city	string	No	Yes	City (combined as "City, State" on PDF)
state	string	No	Yes	State/province
zip_code	string	No	Yes	Postal code (combined as "Zip Country" on PDF)
country	string	No	Yes	Country name
client object (required, nullable for draft invoices)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Client identifier
full_name	string	Yes	No	Client display name (rendered as receiver name)
company_name	string	No	Yes	Client company
email	string	No	Yes	Client email
phone	string	No	Yes	Client phone
address_line_one	string	No	Yes	Client street address
address_line_two	string	No	Yes	Client address line 2
city	string	No	Yes	Client city
state	string	No	Yes	Client state
zip_code	string	No	Yes	Client zip
country	string	No	Yes	Client country
client_id_number	string	No	Yes	Customer identifier
fax	string	No	Yes	Fax number
line_items array (required)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Line item identifier
position	integer	Yes	No	Sort order (1-based)
name	string	Yes	No	Item name
description	string	No	Yes	Item description
quantity	string (decimal)	Yes	No	Quantity as string ("10.00")
unit_price	string (decimal)	Yes	No	Price before item discount
net_price	string (decimal)	Yes	No	Price after item discount
discount_value	string (decimal)	No	Yes	Item-level discount value
discount_type	string (enum)	No	Yes	"PERCENTAGE" or "FLAT"
tax	object	No	Yes	Item-level tax {id, name, rate}
unit_type	object	No	Yes	Unit of measure {id, name}
category	object	No	Yes	Item category {id, name}
discount object (optional, nullable)
Key	Type	Required	Nullable	Description
type	string (enum)	Yes	No	"PERCENTAGE" or "FLAT"
value	string (decimal)	Yes	No	Discount value (e.g., "10.00" for 10%)
amount	string (decimal)	Yes	No	Calculated discount amount
tax object (optional, nullable)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Tax identifier
name	string	Yes	No	Tax label (e.g., "Sales Tax")
rate	string (decimal)	Yes	No	Tax percentage (e.g., "8.00")
amount	string (decimal)	Yes	No	Pre-calculated tax amount
totals object (required)
Key	Type	Required	Nullable	Description
subtotal	string (decimal)	Yes	No	Sum of (netPrice * quantity) for all items
discount_amount	string (decimal)	Yes	No	Invoice-level discount amount
discounted_subtotal	string (decimal)	Yes	No	subtotal - discount_amount
tax_amount	string (decimal)	Yes	No	Tax on discounted_subtotal
shipping_cost	string (decimal)	Yes	No	Shipping charge
total	string (decimal)	Yes	No	discounted_subtotal + tax_amount + shipping_cost
total_paid	string (decimal)	Yes	No	Sum of all payment amounts
balance_due	string (decimal)	Yes	No	total - total_paid
currency object (required)
Key	Type	Required	Nullable	Description
code	string	Yes	No	ISO 4217 code (e.g., "USD")
symbol	string	Yes	No	Currency symbol (e.g., "$")
name	string	Yes	No	Full currency name
decimals	integer	Yes	No	Decimal places (usually 2)
payments array (required, can be empty)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Invoice-payment link ID
payment_id	string (UUID)	Yes	No	Payment record ID
amount_applied	string (decimal)	Yes	No	Amount applied to this invoice
applied_date	string (ISO 8601)	Yes	No	Date payment was applied
payment_number	string	No	Yes	Payment reference number
reference_number	string	No	Yes	External reference
payment_instructions object (optional, nullable)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Payment instruction ID
method	string	Yes	No	Payment method name
fields	object (key-value)	Yes	No	Dynamic fields (bank details, etc.)
terms object (optional, nullable)
Key	Type	Required	Nullable	Description
id	string (UUID)	Yes	No	Terms ID
title	string	Yes	No	Terms title
description	string	No	Yes	Terms body text
template object (required)
Contains all visibility toggles and styling needed to configure the PDF renderer. All show_* fields are booleans. color is a hex string. header_background is a nested object describing the header background type.

signature / stamp objects (optional, nullable)
Key	Type	Description
id	string (UUID)	Entity ID
name	string	Display name
image_url	string (URL)	URL to image
offset_x	number (0-1)	Relative X position on page
offset_y	number (0-1)	Relative Y position on page
scale	number (0-1)	Size as ratio of page width
translations object (optional)
Contains all translatable label strings used in the PDF. If omitted, defaults are used (English).

GET /api/invoices — List Response Schema

{
  "invoices": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "invoice_number": "INV-2026-03-001",
      "invoice_date": "2026-03-12T00:00:00Z",
      "due_date": "2026-03-19T00:00:00Z",
      "status": "DRAFT",
      "total_amount": "1410.10",
      "total_paid": "500.00",
      "balance_due": "910.10",
      "currency_code": "USD",
      "currency_symbol": "$",
      "client": {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Smith",
        "company_name": "Smith Industries"
      },
      "date_created": "2026-03-12T10:30:00Z",
      "date_updated": "2026-03-12T10:30:00Z"
    }
  ],
  "summary": {
    "total_revenue": "15000.00",
    "total_paid": "8500.00",
    "total_unpaid": "6500.00",
    "total_overdue": "2000.00",
    "status_counts": {
      "draft": 5,
      "sent": 3,
      "paid": 10,
      "partial": 2,
      "overdue": 1,
      "cancelled": 0
    }
  },
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 21,
    "total_pages": 2
  }
}
Query Parameters:

?status=DRAFT — Filter by status
?business_id=UUID — Filter by business
?page=1&page_size=20 — Pagination
?sort=date_created&order=desc — Sorting
Logo Serving Approach
Recommendation: URL-based with a separate image upload endpoint

The mobile app stores logos as ImageBitmap locally and syncs via POST /api/uploads/batch (multipart/form-data). The API should:

Store images on server (S3/CDN) during sync upload
Return URL in response as logo_url, image_url fields
Separate endpoint: GET /api/uploads/:id for downloading images by ID
Logo URL in invoice response: Included directly in the business.logo_url field
Same pattern for: signature images, stamp images, header background images, page background images
This matches the existing mobile architecture where logoUrl and ImageMetadata are separate from the business entity.

Totals Calculation Decision
Recommendation: Return BOTH pre-calculated totals AND raw data

Justification based on what the mobile app does:

The mobile app calculates totals client-side in NewInvoiceUiState computed properties:


subtotal = SUM(item.netPrice * item.quantity)  // for non-deleted items
invoiceDiscountAmount = PERCENTAGE: (subtotal * discountValue / 100), FLAT: discountValue
discountedSubtotal = subtotal - invoiceDiscountAmount
invoiceTaxAmount = (discountedSubtotal * tax.rate / 100)
calculatedShippingCost = shippingCost (direct value)
total = discountedSubtotal + invoiceTaxAmount + calculatedShippingCost
totalPayments = SUM(payment.amountApplied)
balanceDue = total - totalPayments
Decision: The API should return pre-calculated totals in the totals object (for display in list views, quick rendering) while also returning all raw data (items, tax rate, discount value/type) so clients can verify or recalculate. The stored/pre-calculated totals are the source of truth — this is the "offline-first" pattern the app already uses (totals stored in InvoiceEntity.subtotal, totalAmount, etc.).

Auth Approach
Recommendation: JWT Bearer Token

This matches the existing mobile app architecture:

Token stored in DataStore
Auto-attached via Ktor HTTP interceptor
7-day expiration

Authorization: Bearer <jwt_token>
Endpoints:

POST /api/auth/login → returns { access_token, refresh_token, expires_in }
POST /api/auth/refresh → refreshes expired token
All invoice endpoints require valid Bearer token
Token includes userId claim for data scoping
Error Response Shape

{
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice with ID 550e8400-... was not found",
    "status": 404
  }
}
Standard Error Codes
404 Not Found:


{
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice with the specified ID does not exist",
    "status": 404
  }
}
401 Unauthorized:


{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "status": 401
  }
}
403 Forbidden:


{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this invoice",
    "status": 403
  }
}
400 Bad Request:


{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "status": 400,
    "details": [
      { "field": "invoice_number", "message": "Invoice number is required" }
    ]
  }
}
500 Internal Server Error:


{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "status": 500
  }
}
