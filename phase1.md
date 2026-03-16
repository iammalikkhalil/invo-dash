═══════════════════════════════════════
PHASE 1 — ANALYSIS REPORT
═══════════════════════════════════════
1. Project Structure
Module Map (30 Gradle modules)

InvotickProject/
├── composeApp/              → Main app entry, navigation (App.kt), platform code
├── core/
│   ├── model/              → (Reserved; models live in domain/)
│   ├── data/               → Data-layer base classes, repository interfaces
│   ├── network/            → Ktor HTTP client factory
│   ├── database/           → Room DatabaseFactory, DAO interfaces, entity stubs
│   ├── datastore/          → DataStore preferences
│   ├── common/             → Utilities, extensions, Constants.kt, formatters
│   └── ui/                 → Theme, reusable Compose components
├── domain/                  → Domain models, repository interfaces, use cases, enums
├── data/                    → Room entities, DAOs, mappers, DTOs, sync system, repositories
├── feature/
│   ├── auth/               → Login, signup, OTP
│   ├── splash/             → Splash screen
│   ├── dashboard/          → Home/dashboard
│   ├── invoice/            → Invoice create/edit/list/preview/save (largest module)
│   ├── customer/           → Customer management + ledger PDF
│   ├── product/            → Product catalog
│   ├── reports/            → Reporting
│   ├── settings/           → App settings
│   ├── company/            → Business/company management
│   ├── onboarding/         → Onboarding flow
│   ├── language/           → Localization
│   ├── paymentForm/        → Payment forms
│   ├── expense/            → Expense tracking
│   └── receivedInvoice/    → Received invoices
├── invoicePdf/              → PDF rendering engine (Canvas-based modules)
├── stamp/                   → Stamp/watermark rendering engine
├── user/                    → User profile module
├── landing/                 → Landing/theme screen
└── shared/                  → Shared multiplatform code
Key Dependencies
Library	Version	Purpose
Kotlin	2.3.0	Language
Compose Multiplatform	1.10.0	UI framework
Room	2.8.3	Database ORM
Ktor	3.0.0	HTTP client
Koin	4.1.1	Dependency injection
Kotlinx Serialization	1.9.0	JSON
Kotlinx DateTime	0.7.1	Date/time
BigNum	0.3.10	Decimal arithmetic
Coil	3.3.0	Image loading
Navigation Compose	2.9.0-rc01	Navigation
Android PDF: android.graphics.pdf.PdfDocument	N/A	PDF generation (Android)
iOS PDF: PDFKit + Skia	N/A	PDF generation (iOS)
Database: AppDatabase v26, 27 entities, 18+ DAOs
2. Invoice Data Models
2.1 Domain Model: Invoice
File: Invoice.kt

Field	Type	Nullable	Default
id	Uuid	No	Uuid.random()
customerId	Uuid?	Yes	null
invoiceNumber	String	No	required
invoiceDate	Instant	No	required
dueDate	Instant	No	required
poNumber	String?	Yes	null
subtotal	BigDecimal	No	required
discountAmount	BigDecimal	No	ZERO
taxAmount	BigDecimal	No	ZERO
shippingCost	BigDecimal	No	ZERO
totalAmount	BigDecimal	No	required
invoiceStatus	InvoiceStatus	No	required
discountType	DiscountType	No	PERCENTAGE
discountValue	BigDecimal	No	ZERO
taxId	Uuid?	Yes	null
termsId	Uuid?	Yes	null
paymentMethodId	Uuid?	Yes	null
notes	String?	Yes	null
templateId	Uuid?	Yes	00000000-0000-0000-0001-000000000001
signatureId	Uuid?	Yes	null
stampId	Uuid?	Yes	null
language	String?	Yes	null
signatureOffset	Offset?	Yes	null
stampOffset	Offset?	Yes	null
signatureScale	Float?	Yes	null
stampScale	Float?	Yes	null
dateCreated	Instant	No	Clock.System.now()
dateUpdated	Instant	No	Clock.System.now()
dateSent	Instant?	Yes	null
dateDeleted	Instant?	Yes	null
isDeleted	Boolean	No	false
isSynced	Boolean	No	false
Computed: discountedSubtotal: BigDecimal = subtotal - discountAmount

2.2 Domain Model: InvoiceItem
File: InvoiceItem.kt

Field	Type	Nullable	Default
id	Uuid	No	Uuid.random()
invoiceId	Uuid	No	required
productId	Uuid	No	required
quantity	BigDecimal	No	required
name	String	No	required
unitPrice	BigDecimal	No	required
netPrice	BigDecimal	No	required
description	String?	Yes	null
categoryId	Uuid?	Yes	null
unitTypeId	Uuid?	Yes	null
discountValue	BigDecimal?	Yes	null
discountType	DiscountType?	Yes	null
taxId	Uuid?	Yes	null
dateCreated	Instant?	Yes	null
dateUpdated	Instant?	Yes	null
dateDeleted	Instant?	Yes	null
isDeleted	Boolean	No	false
isSynced	Boolean	No	false
2.3 InvoicePayment
Field	Type	Nullable	Default
id	Uuid	No	Uuid.random()
invoiceId	Uuid	No	required
paymentId	Uuid	No	required
amountApplied	BigDecimal	No	required
appliedDate	Instant	No	required
dateCreated	Instant	No	required
dateUpdated	Instant?	Yes	null
2.4 InvoiceStatus Enum
Values: DRAFT, SENT, VIEWED, PARTIAL, PAID, OVERDUE, CANCELLED, UNCOLLECTIBLE, REFUNDED

2.5 DiscountType Enum
Values: FLAT (displayName="Flat"), PERCENTAGE (displayName="Percentage")

2.6 InvoiceWithDetails (full invoice + relationships)
Field	Type
invoice	Invoice
clientWithBusinessDetails	ClientWithBusinessDetails? (client + business)
terms	Terms?
tax	Tax?
paymentInstruction	PaymentInstruction?
template	TemplateDetails? (template + header + background)
signature	Signature?
stamp	Stamp?
2.7 Business
Field	Type	Nullable	Default
id	Uuid	No	random
name	String	No	required
shortName	String?	Yes	null
logo	ImageBitmap?	Yes	null
logoUrl	String?	Yes	null
licenseNumber	String?	Yes	null
businessNumber	String?	Yes	null
category	String?	Yes	null
phone	String?	Yes	null
email	String?	Yes	null
website	String?	Yes	null
addressLineOne	String?	Yes	null
addressLineTwo	String?	Yes	null
city	String?	Yes	null
state	String?	Yes	null
zipCode	String?	Yes	null
country	String?	Yes	null
currency	Currency	No	Currency.USD
2.8 Client
Field	Type	Nullable
id	Uuid	No
businessId	Uuid	No
fullName	String	No
email	String?	Yes
phone	String?	Yes
addressLineOne	String?	Yes
addressLineTwo	String?	Yes
city	String?	Yes
state	String?	Yes
zipCode	String?	Yes
country	String?	Yes
companyName	String?	Yes
clientIdNumber	String?	Yes
fax	String?	Yes
currencyCode	String?	Yes
2.9 Tax
Field	Type
id	Uuid
businessId	Uuid?
name	String
rate	BigDecimal
description	String?
isSystemDefault	Boolean
2.10 Currency
Field	Type	Default
code	String	required
symbol	String	required
name	String	required
countries	List<String>	emptyList()
decimals	Int	2
isActive	Boolean	true
180+ predefined currencies. Computed: displayName = "$code - $name"

2.11 Terms
Field	Type
id	Uuid
title	String
description	String?
2.12 PaymentInstruction
Field	Type
id	Uuid
method	String
fields	Map<String, String>
fieldsToString() builds multiline key: value text.

2.13 Signature & Stamp
Both hold: id, businessId, image: ImageBitmap?, name, description

2.14 Template
Field	Type	Default
id	Uuid	required
templateStyle	Int	required
templateName	String	required
isCustom	Boolean	true
color	String?	null
showBusinessLogo	Boolean	true
showInvoiceMeta	Boolean	true
showTitle	Boolean	true
showSender	Boolean	true
senderSoftWrapText	Boolean	false
showReceiver	Boolean	true
receiverSoftWrapText	Boolean	false
showPayment	Boolean	true
showTerms	Boolean	true
showTotal	Boolean	true
showItemTable	Boolean	true
itemTableHeaderAlignment	String?	"Left"
itemTableBodyAlignment	String?	"Left"
headerBackground	Uuid?	null
headerOverlayAlpha	Float?	null
background	Uuid?	null
backgroundOpacity	Float?	null
2.15 TemplateDetails
Wraps: template: Template, header: Header?, background: Background?

2.16 Header
Field	Type
backgroundType	String ("NONE"/"COLOR"/"THEME"/"IMAGE")
colorHex	String?
themeType	String?
themeAlpha	Float?
themeOverlayHex	String?
themeOverlayAlpha	Float?
imageData	ImageBitmap?
imageAlpha	Float?
imageScaleType	String? ("CROP"/"FIT"/"STRETCH"/"TILE")
imageOverlayHex	String?
imageOverlayAlpha	Float?
2.17 Background
Holds: id, image: ImageBitmap?, name, description

2.18 Discount (value object)
Field	Type	Default
value	String	required
discountType	DiscountType	PERCENTAGE
2.19 InvoiceTranslations
Full translation container for every section of the invoice. Holds translated labels for sender, receiver, meta info, items columns, totals labels, terms header, payment instructions header. Default English labels.

2.20 InvoiceSummary (for list views)
Field	Type
invoice	Invoice
client	Client?
totalPaidAmount	String ("0")
Computed: remainingBalance = total - paid

2.21 DTO Mapping Notes
InvoiceDto.clientId ↔ domain customerId
InvoiceItemDto.inventoryItemId ↔ domain productId
InvoiceItemDto.itemCategoryId ↔ domain categoryId
InvoiceDto.currency → ISO currency code string
Domain uses BigDecimal, entities use String, DTOs use Double
Domain uses Instant, entities/DTOs use ISO 8601 String
No Ship-To separate from Bill-To. The app has only one receiver/client address block.

3. Invoice Preview — Visual Specification
3.1 Canvas / Page Dimensions
Reference width: 595px (A4 @ 72 DPI)
Reference height: 842px (A4 @ 72 DPI)
Content padding: ModulePadding.all(10f) → 10% of canvas width ≈ 59.5px on each side (reduced in production to ~20f default, or 3% for templates)
Scale system: InvoiceScaleSystem with referenceWidthDp=210.dp (A4 width in mm)
3.2 Layout Structure (Default Template)
All 10 templates follow the same structural pattern:


┌─────────────────────────────────────────┐
│ HEADER (ThemeBackground: PRIMARY_VARIANT)│
│  ┌──────┐                  ┌──────────┐ │
│  │ Logo │                  │ "Invoice" │ │
│  └──────┘                  └──────────┘ │
│  Padding: all(0.033f) ≈ 20px            │
│  Arrangement: START_SPACE_BETWEEN       │
│  Alignment: CENTER_VERTICALLY           │
├─────────────────────────────────────────┤
│ BODY ROW 1: Sender | Receiver | Meta   │
│  Padding: all(0.03f) ≈ 18px            │
│  Arrangement: CENTER                    │
├─────────────────────────────────────────┤
│ BODY ROW 2: Item Table                  │
│  Padding: horizontal(0.03f)             │
├─────────────────────────────────────────┤
│ BODY ROW 3: PaymentInstructions | Totals│
│  Padding: horizontal(0.03f)             │
│  Arrangement: SPACE_BETWEEN             │
├─────────────────────────────────────────┤
│ FOOTER: Terms & Conditions              │
│  Padding: all(0.03f) ≈ 18px            │
│  Arrangement: START                     │
└─────────────────────────────────────────┘
3.3 Typography
All text uses a single FontFamily passed to the renderer. Font sizes are ratios of canvas width:

Element	Size Ratio	Size at 595px	Weight
Invoice title ("Invoice")	0.14f	~83sp	FontWeight.Black
Section headers ("From", "To", meta header)	0.02f	~12sp	FontWeight.ExtraBold
Body text (address, meta values)	0.0175f	~10sp	FontWeight.Medium
Table header	0.02f	~12sp	FontWeight.ExtraBold
Table body	0.0175f	~10sp	FontWeight.Bold
Totals labels	0.0175f	~10sp	FontWeight.Bold
Totals "TOTAL" row	0.0175f	~10sp	FontWeight.ExtraBold
Terms/Payment header	0.02f	~12sp	FontWeight.ExtraBold
Terms/Payment body	0.0175f	~10sp	FontWeight.Medium
Line height: Equals font size. Style: LineHeightStyle(alignment=CENTER, trim=Both)

Text colors: Resolved from RenderContext:

Default body: Color.Black
Accent: Theme primary color
In header section: onPrimary (white or black based on background luminance)
3.4 Logo Module
Size: 0.15f ratio = ~89px at 595px canvas
Clipping: NONE (default), also supports CIRCLE, ROUNDED_RECT
Corner radius: 0.017f ratio = ~10px for ROUNDED_RECT
Alignment: Left-aligned
Cropping: Crops to square if aspect ratio != 1
3.5 Title Module
Text: "Invoice" (from invoice.title, default "Invoice")
Shadow enabled by default:
Light text → White shadow (alpha 0.8)
Dark text → Black shadow (alpha 0.3)
Offset: 2px, Blur: 4px (scaled by font)
Can be rotated via bendAngle
3.6 Sender Module ("From")
Width: 0.9f of available (shared in row with receiver + meta)
Header: "From" → ExtraBold
Lines: Name, Address1, Address2, CityState, ZipCountry, Phone, Email
Minimum lines: 2 (padded if fewer)
3.7 Receiver Module ("To")
Width: 0.9f, right-aligned
Header: "Bill To" → ExtraBold
Same line structure as Sender
3.8 Invoice Meta Module
Width: 0.8f, right-aligned
Lines: Invoice #, Issue Date, Due Date, P.O # (optional)
Shadow enabled, same logic as title
3.9 Item Table
Column widths: [0.4f, 0.12f, 0.12f, 0.12f, 0.12f, 0.12f]
→ Description (40%), Qty (12%), Price (12%), Disc (12%), Tax (12%), Amount (12%)

Plus an auto-prefixed S# column at 0.06f width.

Headers: S#, Description, Qty, Price, Disc, Tax, Amount
Header alignment: TextAlign.Left
Body alignment: TextAlign.Left
Min rows: 9 (empty rows rendered for visual consistency)
Alternate row colors: Yes (theme primary @ 5% alpha)
Border config:

Outer borders: shown (theme color, 0.5px)
Inner lines: hidden
Header borders: shown
Header inner lines: hidden Cell padding: 3.dp Text wrapping: enabled for description column
3.10 Totals Module
Position: Right-aligned, in SPACE_BETWEEN row with PaymentInstructions
Label width ratio: 0.16f (~95px)
Value width ratio: 0.22f (~131px)
Cell padding ratio: 0.007f (~4px)
Rows displayed:

SUB TOTAL
DISCOUNT
TAX
SHIPPING (if present)
TOTAL (ExtraBold, themed background)
Border config:

Outer: shown, 0.5px, theme color
Inner: hidden
Corner radius: 0
3.11 Terms Module
Header: "Terms and Conditions" (ExtraBold)
Body: Terms description text (Medium)
Hidden if body is blank/null
3.12 Payment Instructions Module
Header: "Payment Instructions" (ExtraBold)
Body: Payment instruction text (Medium)
Hidden if body is blank/null
3.13 Draggable Signature & Stamp
Default size: 0.168f ratio = ~100px
User-draggable to any position on canvas
Stored as relative Offset (0.0-1.0)
Signature default position: Offset(0.60, 0.65)
Stamp default position: Offset(0.81, 0.65)
Selection UI: dashed blue border, blue corner indicators