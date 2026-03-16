You are a senior Next.js frontend engineer.

You have been given two analysis files from a KMP Android 
invoice app:
- phase1.md → Full mobile app analysis (data models, UI spec, 
  PDF spec, visual details)
- phase2.md → API contract design

Your job right now is:
1. Read both files completely
2. Explore the existing Next.js admin panel project structure
3. Make a detailed implementation plan for an Invoice Preview 
   module
4. Wait for approval before writing any code

---

## STEP 1 — READ THE ANALYSIS FILES

Read both files first before touching the project:

cat phase1.md
cat phase2.md

Study them thoroughly. Understand:
- Every data field in the Invoice model
- The exact visual layout of the invoice (canvas dimensions, 
  spacing, typography, sections)
- The template & theme system
- How totals are calculated
- All conditional rendering rules

---

## STEP 2 — EXPLORE THE NEXT.JS PROJECT

After reading the files, explore the admin panel:

STEP 2.1 — Project structure:
find . -type f -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | sort

STEP 2.2 — Package dependencies:
cat package.json

STEP 2.3 — Existing sidebar/navigation:
Find the sidebar component file. Look for:
- Navigation items / menu items
- How routes are defined
- How sidebar links are structured

STEP 2.4 — Existing pages/app structure:
Find the pages/ or app/ directory and understand:
- Routing convention used (pages router or app router?)
- How existing feature pages are structured
- Folder naming convention

STEP 2.5 — Existing invoice-related files (if any):
find . -type f | xargs grep -l -i "invoice" 2>/dev/null | grep -v node_modules | grep -v .next

IMPORTANT: There is an existing invoice preview somewhere 
in the project. Find it. Understand it. But DO NOT touch it 
or modify it. It belongs to its own flow. You will create 
a completely separate, new screen for this task.

STEP 2.6 — Styling system:
- Is it Tailwind CSS? CSS Modules? styled-components?
- Find the global styles file
- Find if there is a theme/color system

STEP 2.7 — Component conventions:
Look at 2-3 existing feature pages and note:
- How components are organized (by feature? shared?)
- TypeScript usage patterns
- Import conventions

---

## STEP 3 — DEFINE THE DUMMY INVOICE DATA

Based on phase1.md data models, create a comprehensive 
dummy invoice data object in your plan.

The dummy data must:
- Cover EVERY field from the Invoice, InvoiceItem, 
  Business, Client, Tax, Currency, Terms, 
  PaymentInstruction, Template models
- Include realistic values (not "test", "foo", "bar")
- Include at least 4 line items
- Include a discount (percentage type)
- Include a tax entry
- Include shipping cost
- Include payment instructions
- Include terms and conditions
- Include a business with full address
- Include a client with full address
- Set template color to a specific hex (e.g. #2563EB)
- Set status to SENT

This dummy data will be the ONLY data source during 
development. No API calls. No fetching. Just this 
hardcoded object.

Define the complete TypeScript interface for this data 
and the dummy data object in your plan.

---

## STEP 4 — IMPLEMENTATION PLAN

Produce a detailed plan with the following sections:

### 4.1 Sidebar Change
- Exact file to modify
- Where to add the "Invoices" menu item
- What icon to use (match existing icon library)
- What route it will link to (e.g. /invoices or /invoice-preview)
- Show the exact code change (before → after)

### 4.2 New Page / Route
- Exact file path to create
- Route URL
- Page component name
- How it fits the existing routing convention

### 4.3 Component Architecture
List every component to create for the invoice preview.
For each component:
- File path
- Component name  
- Props (TypeScript interface)
- What section of the invoice it renders
- Which section in phase1.md it maps to

Map directly from phase1.md sections:
- InvoiceHeader → (logo + title + theme background)
- InvoiceSenderReceiver → (From block + To block + Meta block)
- InvoiceItemsTable → (line items table)
- InvoiceTotals → (subtotal, discount, tax, shipping, total)
- InvoicePaymentInstructions → (payment info block)
- InvoiceTerms → (terms and conditions block)
- InvoicePage → (assembles all above, A4 canvas container)
- InvoicePreviewScreen → (full screen wrapper, toolbar)

### 4.4 A4 Canvas Approach
From phase1.md:
- Reference width: 595px, height: 842px
- Content padding: ~20px sides

Decide and justify:
- Fixed 595px width container with CSS?
- Or scaled to viewport with transform: scale()?
- How to handle overflow for long invoices (multi-page?)
- How to make it look like a paper document on screen

### 4.5 Typography Plan
From phase1.md typography ratios:
- What web font to use? (Google Fonts? System font?)
- How to implement ratio-based font sizes in CSS/Tailwind?
- Map every font size ratio to exact px values at 595px

### 4.6 Color & Theme Plan
From phase1.md template system:
- The dummy data has a template color (#2563EB or similar)
- Which elements use this accent color?
- How to pass theme color through components as a prop?

### 4.7 Conditional Rendering Plan
List every conditional from phase1.md and how 
it will be handled in React:
- No logo → show placeholder or hide?
- Discount = 0 → hide row
- Tax = 0 → hide row
- Shipping = 0 → hide row
- Empty notes → hide section
- Empty terms → hide section
- Status badges (DRAFT/PAID/OVERDUE watermark)

### 4.8 File Structure
Show the complete new file/folder structure to create:

src/
  features/
    invoice-preview/          (or match existing convention)
      components/
        InvoicePage.tsx
        InvoiceHeader.tsx
        InvoiceSenderReceiver.tsx
        InvoiceItemsTable.tsx
        InvoiceTotals.tsx
        InvoicePaymentInstructions.tsx
        InvoiceTerms.tsx
        InvoicePreviewScreen.tsx
      types/
        invoice.types.ts
      data/
        dummyInvoice.ts
      index.ts
  app/
    invoice-preview/
      page.tsx              (or pages/ equivalent)

Adjust folder names to match the existing project convention.

### 4.9 What NOT to Touch
Explicitly list:
- The existing invoice preview file(s) — do not modify
- Any existing invoice routes — do not modify
- The sidebar file — only ADD one item, nothing else

---

## OUTPUT FORMAT

Present your plan exactly like this:

════════════════════════════════════════
SECTION 1 — PROJECT EXPLORATION FINDINGS
════════════════════════════════════════

### Routing Convention
[pages or app router, findings]

### Sidebar Component
[file path, current items, where to add]

### Styling System
[Tailwind/CSS Modules/etc, findings]

### Existing Invoice Files
[list of found files — these will NOT be touched]

### Component Conventions
[how existing features are structured]

════════════════════════════════════════
SECTION 2 — DUMMY INVOICE DATA
════════════════════════════════════════

### TypeScript Interfaces
[complete interfaces for all models]

### Dummy Invoice Object
[complete hardcoded data object]

════════════════════════════════════════
SECTION 3 — IMPLEMENTATION PLAN
════════════════════════════════════════

### 3.1 Sidebar Change
[exact file, exact code change]

### 3.2 New Route
[file path, URL]

### 3.3 Component Architecture
[every component mapped to phase1.md sections]

### 3.4 A4 Canvas Approach
[decision + justification]

### 3.5 Typography Plan
[font choice, size mapping table]

### 3.6 Color & Theme Plan
[how accent color flows through components]

### 3.7 Conditional Rendering Plan
[every condition listed]

### 3.8 Complete File Structure
[full folder tree of new files]

### 3.9 Files NOT to Touch
[explicit list]

════════════════════════════════════════
STOP. WAIT FOR APPROVAL BEFORE CODING.
════════════════════════════════════════

---

BEGIN NOW.
Start with: cat phase1.md && cat phase2.md
Then explore the project structure.
Then produce the plan.
Do not write any component code until I approve the plan.