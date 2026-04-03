# Webpanel API Documentation (Admin Panel)

Base:
- Webpanel routes: `/v1/webpanel/**`
- Auth: **Not required** (intended only for internal/admin panel usage)
- Response wrapper: `ApiResponse<T>` => `{ success: boolean, message: string, data: T | null }`

Notes:
- These APIs are intentionally public in `src/main/resources/application.properties` via `security.public-paths=/v1/webpanel/**`.
- Do not use these endpoints for a public client app without adding auth/authorization.

---

## 1) Login (email/password)

POST `/v1/auth/login`

Request
```json
{
  "email": "user@example.com",
  "password": "password",
  "notificationToken": "optional-push-token"
}
```

Response (`data`: `AuthResponse`)
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "jwt",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "username": "john",
      "phoneNumber": "+15555555555",
      "profilePictureUrl": "https://...",
      "role": "USER",
      "isEmailVerified": true,
      "lastLoginAt": "2026-03-01T09:00:00",
      "createdAt": "2026-02-01T10:15:30"
    },
    "message": "Login successful"
  }
}
```

---

## 2) Get all users with stats

GET `/v1/webpanel/getAllUsersWithStats`

Use this endpoint for the webpanel users screen.

Response (`data`: `WebpanelUserWithStatsResponse[]`)
```json
{
  "success": true,
  "message": "Users with stats fetched successfully",
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "username": "john",
      "phoneNumber": "+15555555555",
      "profilePictureUrl": "https://...",
      "role": "USER",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-02-01T10:15:30",
      "stats": {
        "lastLoginAt": "2026-03-01T09:00:00",
        "allTime": { "activity": { "overallLastActivityAt": "2026-03-01T09:00:00" }, "counts": { "invoices": 50 }, "totals": { "invoiceTotalAmount": 12000.50, "paymentTotalAmount": 8000.00, "expenseTotalAmount": 900.25 }, "lastUpdatedAt": { "invoices": "2026-03-01T08:00:00" } },
        "last30Days": { "activity": { "overallLastActivityAt": "2026-03-01T09:00:00" }, "counts": { "invoices": 10 }, "totals": { "invoiceTotalAmount": 2500.00, "paymentTotalAmount": 1200.00, "expenseTotalAmount": 110.00 }, "lastUpdatedAt": { "invoices": "2026-03-01T08:00:00" } }
      }
    }
  ]
}
```

---

## 3) Get all users with stats and analytics

GET `/v1/webpanel/getAllUsersWithStatAndAnalytics`

Use this endpoint for the webpanel users screen when you need the existing stats plus Analytics V2 information.

### Analytics source

This endpoint enriches each user with data derived from the Analytics V2 pipeline:
- `analytics_sessions_v2`
- `analytics_events`
- `analytics_user_properties`

### What is included

For each user, the response contains:
- the same base user fields as `/getAllUsersWithStats`
- the same `stats` block as `/getAllUsersWithStats`
- a new `analytics` block with:
  - overall analytics totals
  - `locations[]`
  - `devices[]`
  - `appVersions[]`
  - `events[]`
  - `userProperties[]`

### Notes

- This is Analytics V2 focused.
- Session-derived information comes from `analytics_sessions_v2`.
- Event-derived information comes from `analytics_events` as written by the V2 tracking flow.
- User-property information comes from `analytics_user_properties` as written by the V2 tracking flow.
- `locations` currently use the fields available in the V2 session model: `country` and `city`.
- Values are de-duplicated within each analytics group, while counts and timestamps still reflect all matching records.

Response (`data`: `WebpanelUserWithStatsAndAnalyticsResponse[]`)
```json
{
  "success": true,
  "message": "Users with stats and analytics fetched successfully",
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "username": "john",
      "phoneNumber": "+15555555555",
      "profilePictureUrl": "https://...",
      "role": "USER",
      "isEmailVerified": true,
      "isActive": true,
      "createdAt": "2026-02-01T10:15:30",
      "stats": {
        "lastLoginAt": "2026-03-01T09:00:00",
        "allTime": {
          "activity": { "overallLastActivityAt": "2026-03-01T09:00:00" },
          "counts": { "invoices": 50 },
          "totals": {
            "invoiceTotalAmount": 12000.50,
            "paymentTotalAmount": 8000.00,
            "expenseTotalAmount": 900.25
          },
          "lastUpdatedAt": { "invoices": "2026-03-01T08:00:00" }
        },
        "last30Days": {
          "activity": { "overallLastActivityAt": "2026-03-01T09:00:00" },
          "counts": { "invoices": 10 },
          "totals": {
            "invoiceTotalAmount": 2500.00,
            "paymentTotalAmount": 1200.00,
            "expenseTotalAmount": 110.00
          },
          "lastUpdatedAt": { "invoices": "2026-03-01T08:00:00" }
        }
      },
      "analytics": {
        "totalSessions": 18,
        "totalEvents": 245,
        "totalUserProperties": 6,
        "totalDistinctDevices": 2,
        "totalDistinctLocations": 2,
        "totalDistinctAppVersions": 3,
        "firstSeenAt": "2026-02-10T06:30:00Z",
        "lastSeenAt": "2026-04-03T11:45:00Z",
        "locations": [
          {
            "country": "Pakistan",
            "city": "Karachi",
            "sessionCount": 11,
            "firstSeenAt": "2026-02-10T06:30:00Z",
            "lastSeenAt": "2026-04-03T11:45:00Z",
            "deviceIds": ["device-android-001"],
            "appVersions": ["2.4.0", "2.5.0"],
            "platforms": ["ANDROID"]
          }
        ],
        "devices": [
          {
            "deviceId": "device-android-001",
            "appInstanceIds": ["app-inst-1"],
            "deviceModels": ["Pixel 7"],
            "manufacturers": ["Google"],
            "deviceClasses": ["phone"],
            "platforms": ["ANDROID"],
            "osVersions": ["14"],
            "appVersions": ["2.4.0", "2.5.0"],
            "languages": ["en-US"],
            "countries": ["Pakistan"],
            "cities": ["Karachi"],
            "networkTypes": ["wifi", "mobile"],
            "screenSizes": ["1080x2400"],
            "sessionCount": 11,
            "firstSeenAt": "2026-02-10T06:30:00Z",
            "lastSeenAt": "2026-04-03T11:45:00Z"
          }
        ],
        "appVersions": [
          {
            "appVersion": "2.5.0",
            "sessionCount": 7,
            "firstSeenAt": "2026-03-20T08:00:00Z",
            "lastSeenAt": "2026-04-03T11:45:00Z",
            "deviceIds": ["device-android-001"],
            "deviceModels": ["Pixel 7"],
            "manufacturers": ["Google"],
            "deviceClasses": ["phone"],
            "platforms": ["ANDROID"],
            "osVersions": ["14"],
            "countries": ["Pakistan"],
            "cities": ["Karachi"],
            "appInstanceIds": ["app-inst-1"]
          }
        ],
        "events": [
          {
            "eventName": "invoice_created",
            "count": 42,
            "firstSeenAt": "2026-02-10T07:00:00Z",
            "lastSeenAt": "2026-04-03T11:40:00Z",
            "screenNames": ["CreateInvoiceScreen"],
            "screenClasses": ["CreateInvoiceActivity"],
            "previousScreens": ["DashboardScreen"],
            "itemIds": [],
            "itemNames": [],
            "sessionIds": ["9bc8b282-b3b4-4aa1-bf2c-4dbbe537e5d1"],
            "appInstanceIds": ["app-inst-1"]
          }
        ],
        "userProperties": [
          {
            "propertyName": "subscription_plan",
            "values": ["pro"],
            "appInstanceIds": ["app-inst-1"],
            "count": 1,
            "firstSetAt": "2026-02-10T06:31:00Z",
            "lastSetAt": "2026-02-10T06:31:00Z"
          }
        ]
      }
    }
  ]
}
```

---

## 4) User stats (all-time + last 30 days)

GET `/v1/webpanel/statsByUserId?userId=<UUID>`

Also supported:
- GET `/v1/webpanel/statsbyuserId?userId=<UUID>`

### What is included

This endpoint returns behavior stats derived from **non-analytics** tables:
- Usage: invoices/payments/expenses (counts + totals)
- Setup progress: businesses/clients/inventory/templates/taxes/terms/etc. (counts)
- Recency: per-module last update timestamps + overall last activity timestamp

### Time windows

- `allTime`: all rows (non-deleted) for that user
- `last30Days`:
  - counts/totals are filtered by `createdAt >= now - 30 days`
  - `lastUpdatedAt` and `overallLastActivityAt` are computed using `updatedAt >= now - 30 days`

Response (`data`: `WebpanelUserStatsResponse`)
```json
{
  "success": true,
  "message": "User stats fetched successfully",
  "data": {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "username": "john",
    "role": "USER",
    "isEmailVerified": true,
    "isActive": true,
    "createdAt": "2026-02-01T10:15:30",
    "lastLoginAt": "2026-03-01T09:00:00",
    "allTime": {
      "activity": { "overallLastActivityAt": "2026-03-01T09:00:00" },
      "counts": {
        "businesses": 1,
        "clients": 12,
        "invoices": 50,
        "invoicesByStatus": { "DRAFT": 2, "SENT": 10, "PAID": 30 },
        "invoiceSynced": 45,
        "payments": 20,
        "expenses": 18,
        "expenseSynced": 10,
        "inventoryItems": 35,
        "merchants": 6,
        "templates": 3,
        "templatesSaved": 2,
        "templatesCustom": 1,
        "paymentInstructions": 1,
        "taxes": 2,
        "terms": 1,
        "headers": 1,
        "backgrounds": 1,
        "signatures": 1,
        "stamps": 1,
        "itemCategories": 4,
        "unitTypes": 3
      },
      "totals": {
        "invoiceTotalAmount": 12000.50,
        "paymentTotalAmount": 8000.00,
        "expenseTotalAmount": 900.25
      },
      "lastUpdatedAt": {
        "businesses": "2026-02-15T10:00:00",
        "clients": "2026-02-20T10:00:00",
        "invoices": "2026-03-01T08:00:00",
        "payments": "2026-02-28T12:00:00",
        "expenses": "2026-02-27T12:00:00",
        "inventoryItems": "2026-02-26T12:00:00",
        "merchants": "2026-02-25T12:00:00",
        "templates": "2026-02-24T12:00:00",
        "paymentInstructions": "2026-02-23T12:00:00",
        "taxes": "2026-02-22T12:00:00",
        "terms": "2026-02-21T12:00:00",
        "headers": "2026-02-20T12:00:00",
        "backgrounds": "2026-02-19T12:00:00",
        "signatures": "2026-02-18T12:00:00",
        "stamps": "2026-02-17T12:00:00",
        "itemCategories": "2026-02-16T12:00:00",
        "unitTypes": "2026-02-15T12:00:00"
      }
    },
    "last30Days": { "activity": { "overallLastActivityAt": "2026-03-01T09:00:00" }, "counts": { "invoices": 10 }, "totals": { "invoiceTotalAmount": 2500.00, "paymentTotalAmount": 1200.00, "expenseTotalAmount": 110.00 }, "lastUpdatedAt": { "invoices": "2026-03-01T08:00:00" } }
  }
}
```

---

## 5) List invoices (admin)

GET `/v1/webpanel/invoices`

Optional filter:
- `userId` (UUID): only invoices for a single user

Example:
- GET `/v1/webpanel/invoices?userId=3fa85f64-5717-4562-b3fc-2c963f66afa6`

Response (`data`: `WebpanelInvoiceSummaryResponse[]`)
```json
{
  "success": true,
  "message": "Invoices fetched successfully",
  "data": [
    {
      "id": "7f30b6dd-2012-4d66-99c1-6c23c2d8c1b1",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "clientId": "c4c3b4a1-1111-2222-3333-444455556666",
      "clientName": "Acme Inc",
      "invoiceNumber": "INV-0001",
      "invoiceDate": "2026-03-01",
      "dueDate": "2026-03-15",
      "totalAmount": 250.0,
      "currency": "USD",
      "status": "SENT",
      "isSynced": true,
      "isDeleted": false,
      "createdAt": "2026-03-01T08:00:00",
      "updatedAt": "2026-03-01T08:00:00"
    }
  ]
}
```

---

## 6) Get a single invoice (all data to render)

GET `/v1/webpanel/invoices/{invoiceId}`

Response (`data`: `WebpanelInvoiceFullResponse`)
- `invoice`: main invoice fields + items (from `InvoiceDetailResponse`)
- `client`: full client object
- `tax`, `terms`, `paymentInstruction`: full objects (nullable)
- `template`: template object (nullable)
- `header`, `background`: from template (nullable)
- `signature`, `stamp`: “effective” assets (invoice-level if present, otherwise template-level) (nullable)

Example response shape:
```json
{
  "success": true,
  "message": "Invoice fetched successfully",
  "data": {
    "invoice": {
      "id": "7f30b6dd-2012-4d66-99c1-6c23c2d8c1b1",
      "invoiceNumber": "INV-0001",
      "poNumber": null,
      "invoiceDate": "2026-03-01",
      "dueDate": "2026-03-15",
      "subtotal": 200.0,
      "discountAmount": 0.0,
      "taxAmount": 10.0,
      "shippingCost": 0.0,
      "totalAmount": 210.0,
      "status": "SENT",
      "discountType": "PERCENTAGE",
      "discountValue": 0.0,
      "notes": "Thanks",
      "currency": "USD",
      "language": "en",
      "signatureOffset": null,
      "stampOffset": null,
      "signatureScale": null,
      "stampScale": null,
      "dateSent": null,
      "createdAt": "2026-03-01T08:00:00",
      "updatedAt": "2026-03-01T08:00:00",
      "clientId": "c4c3b4a1-1111-2222-3333-444455556666",
      "taxId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      "termsId": null,
      "paymentInstructionId": null,
      "templateId": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
      "signatureId": null,
      "stampId": null,
      "items": [
        {
          "id": "8d6e7f44-3333-4444-5555-666677778888",
          "inventoryItemId": "99999999-aaaa-bbbb-cccc-dddddddddddd",
          "name": "Service",
          "description": "Monthly",
          "quantity": 1.0,
          "unitPrice": 200.0,
          "netPrice": 200.0,
          "discount": 0.0,
          "discountType": null
        }
      ]
    },
    "client": { "id": "c4c3b4a1-1111-2222-3333-444455556666", "businessId": "....", "name": "Acme Inc", "credit": 0.0, "currencyCode": "USD", "emailAddress": "billing@acme.com", "phone": null, "addressLine1": null, "addressLine2": null, "city": null, "state": null, "zipcode": null, "country": null, "companyName": null, "clientId": null, "faxNumber": null, "additionalNotes": null, "rating": 0, "openingBalance": 0.0, "isDeleted": false, "createdAt": "2026-02-01T10:00:00", "updatedAt": "2026-02-01T10:00:00", "deletedAt": null },
    "tax": { "id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "businessId": "....", "name": "VAT", "rate": 5.0, "isDeleted": false, "createdAt": "2026-02-01T10:00:00", "updatedAt": "2026-02-01T10:00:00", "deletedAt": null },
    "terms": null,
    "paymentInstruction": null,
    "template": { "id": "bbbbbbbb-cccc-dddd-eeee-ffffffffffff", "businessId": "....", "templateName": "Default", "templateImage": null, "templateStyle": 1, "isCustom": false, "isSaved": true, "color": "#FFFFFF", "headerAlpha": 1.0, "backgroundOpacity": 1.0, "description": null, "isDeleted": false, "createdAt": "2026-02-01T10:00:00", "updatedAt": "2026-02-01T10:00:00", "deletedAt": null, "headerId": null, "backgroundId": null, "signatureId": null, "stampId": null },
    "header": null,
    "background": null,
    "signature": null,
    "stamp": null
  }
}
```

---

## Error responses

The backend uses a global exception handler and always returns the wrapper.

Common responses:
- `400` invalid UUIDs / invalid request params
- `404` user/invoice not found
- `500` unexpected server error (e.g., if required relations are missing in DB)

Example:
```json
{
  "success": false,
  "message": "Invoice not found.",
  "data": null
}
```
