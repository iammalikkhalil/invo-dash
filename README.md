# 📘 WEBPANEL ADMIN — COMPLETE DOCUMENTATION

Framework: **Next.js (JavaScript)**
Styling: **Plain CSS (Global Stylesheet)**
Authentication: **Bearer Token (saved in localStorage)**
Theme: **Single Logo + Single Color Scheme**

---

# 1️⃣ PROJECT OVERVIEW

This Webpanel is a simple admin system with the following strict flow:

1. On app load → check login state
2. If not logged in → show Login screen
3. After login → save access token
4. Use token as Bearer for all API requests
5. Show list of users
6. Click user → show user stats + user invoices
7. Click invoice → show full invoice details

There are no extra features.
This is the complete app.

---

# 2️⃣ UI & DESIGN SYSTEM

## 2.1 Logo

* Only **one logo**
* Stored in `/public/logo.png` (or svg)
* Used:

  * Login page header
  * Top navbar of all pages

No alternative logos allowed.

---

## 2.2 Color Scheme (Single Theme)

Use one consistent theme across the app.

Primary Color: Deep Blue
Background Color: Light Neutral
Card Background: White
Text Primary: Dark
Text Secondary: Gray
Danger: Red

No theme switching. No dark mode.

All components must use this theme consistently:

* Buttons
* Cards
* Inputs
* Borders
* Navbar

---

# 3️⃣ APPLICATION FLOW (STRICT)

## APP START

When the app loads:

1. Check if `access_token` exists in `localStorage`
2. If NOT exists:

   * Redirect to `/login`
3. If exists:

   * Go to `/users`

There is no token validation endpoint check required.
Presence of token = logged in.

---

# 4️⃣ AUTHENTICATION FLOW

## 4.1 Login Screen

Route: `/login`

### UI Layout

* Centered card
* Logo at top
* Title: "Admin Login"
* Email input
* Password input
* Login button
* Error message area

### Login Process

1. User enters email + password
2. Send POST request:

```
POST /v1/auth/login
```

Body:

```
{
  email,
  password,
  notificationToken: null
}
```

### On Success

Backend returns:

```
{
  success: true,
  data: {
    accessToken: "...",
    user: {...}
  }
}
```

System must:

1. Extract `accessToken`
2. Save it in:

```
localStorage key: "webpanel_access_token"
```

3. Redirect to `/users`

---

### On Failure

Show:

* API message
* Or generic "Login failed"

---

# 5️⃣ AUTHORIZATION SYSTEM

For every API request after login:

Add HTTP Header:

```
Authorization: Bearer <token>
```

Token comes from:

```
localStorage.getItem("webpanel_access_token")
```

If any API returns unauthorized:

* Remove token
* Redirect to login

---

# 6️⃣ ROUTE STRUCTURE

The application has only these routes:

```
/login
/users
/users/{userId}
/users/{userId}/invoices/{invoiceId}
```

No other pages.

---

# 7️⃣ USERS LIST PAGE

Route: `/users`

## Purpose:

Display all users in card format.

---

## API

```
GET /v1/webpanel/getAllUsers
```

Response returns list of users.

---

## UI Layout

Top:

* Navbar with logo
* Title: "Users"

Below:

* Search bar (important)
* Grid of user cards

---

## User Card Must Show:

* Username
* Email
* Phone number
* Role
* Active status
* Created date

Clicking card → go to:

```
/users/{userId}
```

---

# 8️⃣ SEARCH REQUIREMENT (VERY IMPORTANT)

Search must search from:

* id
* username
* email
* phone number
* role
* status
* any other visible field

It must NOT search only by name.

Implementation rule:

Convert entire object into string and match query against all fields.

Search must be:

* Case insensitive
* Real time (while typing)

This rule applies to:

* Users list
* Invoices list

---

# 9️⃣ USER DETAIL PAGE

Route:

```
/users/{userId}
```

---

# 9.1 USER STATS SECTION

API:

```
GET /v1/webpanel/statsByUserId?userId={UUID}
```

Display:

Show cards for:

* Total invoices
* Paid invoices
* Pending invoices
* Overdue invoices
* Total revenue
* Paid revenue
* Overdue revenue

Stats must be visually separated from invoices list.

---

# 9.2 USER INVOICES LIST

API:

```
GET /v1/webpanel/invoices?userId={UUID}
```

---

## Layout

* Section title: "Invoices"
* Search bar (global search across all fields)
* Table format

Columns:

* Invoice number
* Client name
* Invoice date
* Due date
* Total amount
* Currency
* Status

Each row clickable → go to:

```
/users/{userId}/invoices/{invoiceId}
```

---

# 🔟 INVOICE DETAIL PAGE

Route:

```
/users/{userId}/invoices/{invoiceId}
```

---

## API

```
GET /v1/webpanel/invoices/{invoiceId}
```

---

## Purpose

Display full invoice.

---

## Layout Structure

### 1️⃣ Invoice Header

* Invoice Number
* PO Number (if exists)
* Invoice Date
* Due Date
* Status
* Currency

---

### 2️⃣ Client Information

* Client Name
* Email
* Phone
* Address
* Tax Number (if exists)

---

### 3️⃣ Items Table

Columns:

* Item name
* Description
* Quantity
* Unit price
* Discount
* Net price

---

### 4️⃣ Financial Summary

* Subtotal
* Discount amount
* Tax amount
* Shipping cost
* Total amount

---

### 5️⃣ Notes (if exists)

---

### 6️⃣ Template/Signature/Stamp

If backend returns signature or stamp:

* Display image

---

# 1️⃣1️⃣ ERROR HANDLING

For every page:

If API fails:

* Show error message
* Do not crash UI

If no data:

* Show empty state

---

# 1️⃣2️⃣ LOADING STATES

Every API call must show:

* Loading spinner
* Or loading text

---

# 1️⃣3️⃣ LOGOUT

Optional but recommended:

Navbar → Logout button

On click:

* Remove token from localStorage
* Redirect to /login

---

# 1️⃣4️⃣ SECURITY RULES

* Token only stored in localStorage
* Always attach Bearer token
* Never expose token in UI
* If token missing → redirect to login
* No public routes except login

---

# 1️⃣5️⃣ PROJECT STRUCTURE (High Level)

```
/pages
  login.js
  users/index.js
  users/[userId].js
  users/[userId]/invoices/[invoiceId].js

/components
  Navbar
  Logo
  SearchBar
  UserCard
  StatsCards
  InvoiceTable
  InvoiceView

/lib
  api.js
  auth.js
  search.js

/public
  logo.png

/styles
  globals.css
```

---

# 1️⃣6️⃣ COMPLETE FLOW SUMMARY

1. App loads
2. Check token
3. If not → login
4. Login → save token
5. Show users list
6. Search works across all fields
7. Click user
8. Show stats + invoices
9. Search invoices across all fields
10. Click invoice
11. Show full invoice

That is the entire system.

No dashboards.
No analytics charts.
No role management.
No editing.
No deleting.
No creating.

Read-only webpanel.

---

# ✅ FINAL RESULT

This documentation fully defines:

* Authentication system
* Bearer token handling
* Route structure
* UI structure
* API usage
* Search behavior
* Invoice rendering logic
* Security rules
* Page flow
* Component responsibilities

An AI agent can now build the entire Next.js Webpanel exactly from this documentation.