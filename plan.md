# Webpanel Implementation Plan

## Tracking Rules
- Status values: `not_started`, `in_progress`, `blocked`, `done`
- Priority values: `P0`, `P1`, `P2`
- Update rule: whenever a task starts or finishes, update its checkbox, `Status`, and `Last Updated` date.
- Blocker rule: if blocked, add one short line in `Blockers` with action owner and next step.
- Progress formula: `completed tasks / total tasks` per part.

## Global Tracker
- Project: `invotics-webpanel`
- Plan Owner: `Codex + User`
- Started On: `2026-03-02`
- Last Updated: `2026-03-02`
- Overall Status: `in_progress`
- Overall Progress: `108/125 tasks (86.4%)`

## Part 01 - Foundation and Constraints
- Status: `done`
- Priority: `P0`
- Depends On: `none`
- Progress: `6/6`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Confirm runtime uses Next.js App Router (`/app`) and not Pages Router.
  - [ ] Confirm required routes map to app-router segments.
  - [ ] Confirm environment variable strategy for API base URL.
  - [ ] Define shared API response contract (`ApiResponse<T>`).
  - [ ] Define strict type-safe null handling approach for nullable API fields.
  - [ ] Freeze scope as read-only admin panel (no create/update/delete actions).

## Part 02 - Directory and Module Layout
- Status: `done`
- Priority: `P0`
- Depends On: `Part 01`
- Progress: `6/6`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Create `app/login/page.tsx`.
  - [ ] Create `app/users/page.tsx`.
  - [ ] Create `app/users/[userId]/page.tsx`.
  - [ ] Create `app/users/[userId]/invoices/[invoiceId]/page.tsx`.
  - [ ] Create `lib/` modules (`api`, `auth`, `search`, `format`).
  - [ ] Create `components/` shared UI modules (navbar, states, cards, tables).

## Part 03 - Auth and Token Utilities
- Status: `in_progress`
- Priority: `P0`
- Depends On: `Part 01, Part 02`
- Progress: `7/8`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Implement token key constant: `webpanel_access_token`.
  - [ ] Implement `getAccessToken()` with client-only safety.
  - [ ] Implement `setAccessToken(token)`.
  - [ ] Implement `clearAccessToken()`.
  - [ ] Implement helper `isLoggedIn()` based on token presence.
  - [ ] Implement protected-route client guard utility.
  - [ ] Implement unauthorized redirect helper to `/login`.
  - [ ] Add unit-level sanity checks for auth helper behavior.

## Part 04 - API Client Core
- Status: `in_progress`
- Priority: `P0`
- Depends On: `Part 01, Part 03`
- Progress: `8/10`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Implement base fetch wrapper with base URL support.
  - [ ] Inject bearer token from local storage in authorized calls.
  - [ ] Normalize API success payload parsing.
  - [ ] Normalize API failure payload parsing.
  - [ ] Standardize network error object.
  - [ ] Standardize HTTP error object (`status`, `message`, `data`).
  - [ ] Handle `401/403` by clearing token.
  - [ ] Export typed methods for login/users/stats/invoices endpoints.
  - [ ] Add retry hook for transient fetch failures (manual retry).
  - [ ] Add minimal API integration smoke tests or mocks.

## Part 05 - Shared UI State Components
- Status: `done`
- Priority: `P0`
- Depends On: `Part 02`
- Progress: `7/7`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Create `LoadingState` component (reusable).
  - [ ] Create `ErrorState` component with retry callback.
  - [ ] Create `EmptyState` component with contextual message.
  - [ ] Create consistent card container component.
  - [ ] Create top navbar with logo and optional logout.
  - [ ] Add accessibility labels for state components.
  - [ ] Align visual style to single-theme requirements.

## Part 06 - Login Page
- Status: `done`
- Priority: `P0`
- Depends On: `Part 03, Part 04, Part 05`
- Progress: `9/9`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Build centered login card layout.
  - [ ] Render logo and title `Admin Login`.
  - [ ] Add controlled email input.
  - [ ] Add controlled password input.
  - [ ] Add submit button with pending state.
  - [ ] Call `POST /v1/auth/login` with `notificationToken: null`.
  - [ ] Persist `accessToken` on success.
  - [ ] Redirect to `/users` on success.
  - [ ] Show API or generic error message without crashing.

## Part 07 - Route Protection and Redirect Flow
- Status: `done`
- Priority: `P0`
- Depends On: `Part 03, Part 06`
- Progress: `6/6`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] On app entry, route to `/login` if token missing.
  - [ ] On app entry, route to `/users` if token exists.
  - [ ] Guard `/users` route.
  - [ ] Guard `/users/[userId]` route.
  - [ ] Guard `/users/[userId]/invoices/[invoiceId]` route.
  - [ ] Verify no redirect loops between login and protected pages.

## Part 08 - Users List Data and UI
- Status: `done`
- Priority: `P0`
- Depends On: `Part 04, Part 05, Part 07`
- Progress: `9/9`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Fetch users from `GET /v1/webpanel/getAllUsers`.
  - [ ] Render initial loading state.
  - [ ] Render error state with retry.
  - [ ] Render empty state if no users.
  - [ ] Build user card with required visible fields.
  - [ ] Format created date consistently.
  - [ ] Make entire card clickable.
  - [ ] Navigate to `/users/{userId}` on click.
  - [ ] Ensure layout responsive for mobile and desktop.

## Part 09 - Global Search Utility
- Status: `done`
- Priority: `P0`
- Depends On: `Part 02`
- Progress: `6/6`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Implement generic `matchAnyField(object, query)` utility.
  - [ ] Convert nested object values safely to searchable text.
  - [ ] Ensure case-insensitive matching.
  - [ ] Ensure realtime filtering while typing.
  - [ ] Wire utility into users list.
  - [ ] Wire utility into invoices list.

## Part 10 - User Detail Stats Section
- Status: `done`
- Priority: `P0`
- Depends On: `Part 04, Part 05, Part 07`
- Progress: `8/8`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Fetch stats via `GET /v1/webpanel/statsByUserId?userId={UUID}`.
  - [ ] Add fallback request path support if endpoint case varies.
  - [ ] Render loading state for stats section.
  - [ ] Render section-level error state without blocking invoices section.
  - [ ] Render cards for invoice counts (total/paid/pending/overdue).
  - [ ] Render cards for revenue (total/paid/overdue).
  - [ ] Handle missing fields with safe default values.
  - [ ] Keep stats visually separate from invoice table.

## Part 11 - User Detail Invoices Table
- Status: `done`
- Priority: `P0`
- Depends On: `Part 04, Part 05, Part 07, Part 09`
- Progress: `8/8`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Fetch invoices via `GET /v1/webpanel/invoices?userId={UUID}`.
  - [ ] Render invoices loading state.
  - [ ] Render invoices error state with retry.
  - [ ] Render empty state when no invoices exist.
  - [ ] Build table with required columns.
  - [ ] Add realtime global search across all invoice fields.
  - [ ] Make rows clickable to invoice detail route.
  - [ ] Preserve userId in navigation path correctness.

## Part 12 - Invoice Detail Data and Rendering
- Status: `done`
- Priority: `P0`
- Depends On: `Part 04, Part 05, Part 07`
- Progress: `8/8`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Fetch invoice detail via `GET /v1/webpanel/invoices/{invoiceId}`.
  - [ ] Render page-level loading state.
  - [ ] Render page-level error state (including 404 friendly message).
  - [ ] Render invoice header block.
  - [ ] Render client information block.
  - [ ] Render items table with null-safe values.
  - [ ] Render financial summary block.
  - [ ] Render notes/signature/stamp/template media when present.

## Part 13 - Formatting and Null-Safety Layer
- Status: `done`
- Priority: `P1`
- Depends On: `Part 04`
- Progress: `5/5`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Add `formatDate` helper with invalid-date fallback.
  - [ ] Add `formatCurrency` helper with currency fallback.
  - [ ] Add safe string fallback helper for optional text fields.
  - [ ] Add safe number fallback helper for null numeric fields.
  - [ ] Apply helpers across all pages for consistent display.

## Part 14 - Unauthorized and Session Recovery
- Status: `done`
- Priority: `P0`
- Depends On: `Part 03, Part 04, Part 07`
- Progress: `5/5`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Detect unauthorized API responses globally.
  - [ ] Clear token and local session data on unauthorized.
  - [ ] Redirect to `/login` from protected routes.
  - [ ] Show short session-expired message once after redirect.
  - [ ] Ensure retry after re-login works as expected.

## Part 15 - Navbar and Logout
- Status: `done`
- Priority: `P1`
- Depends On: `Part 03, Part 05`
- Progress: `4/4`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Add logo in navbar on authenticated pages.
  - [ ] Add logout button.
  - [ ] On logout, clear token and redirect to `/login`.
  - [ ] Hide logout on login page.

## Part 16 - Styling and Theme Consistency
- Status: `done`
- Priority: `P1`
- Depends On: `Part 05`
- Progress: `6/6`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Define CSS variables for single color scheme.
  - [ ] Apply consistent button, input, card, and border styles.
  - [ ] Ensure readability for primary and secondary text.
  - [ ] Apply danger color for destructive/error states only.
  - [ ] Ensure no dark mode or theme switching is exposed.
  - [ ] Validate mobile and desktop layout consistency.

## Part 17 - Error Scenarios and Edge Cases
- Status: `in_progress`
- Priority: `P0`
- Depends On: `Part 04, Part 08, Part 10, Part 11, Part 12`
- Progress: `0/6`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Validate handling for `400` invalid UUID/request params.
  - [ ] Validate handling for `404` missing user/invoice.
  - [ ] Validate handling for `500` unexpected server issues.
  - [ ] Validate handling for network failure/offline.
  - [ ] Validate behavior when API returns `success: false` with HTTP 200.
  - [ ] Validate UI never crashes on null `data`.

## Part 18 - End-to-End Flow Validation
- Status: `not_started`
- Priority: `P0`
- Depends On: `Part 06` through `Part 17`
- Progress: `0/4`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Validate full journey: login -> users -> user detail -> invoice detail.
  - [ ] Validate search behavior on users and invoices pages.
  - [ ] Validate token persistence across browser refresh.
  - [ ] Validate redirect behavior when token removed manually.

## Part 19 - Documentation and Handover
- Status: `not_started`
- Priority: `P2`
- Depends On: `Part 18`
- Progress: `0/4`
- Last Updated: `2026-03-02`
- Tasks:
  - [ ] Update README implementation notes to match actual structure.
  - [ ] Document API assumptions and known backend caveats.
  - [ ] Document how to run and verify the webpanel locally.
  - [ ] Add quick troubleshooting section for login/API issues.

## Blockers
- None yet.

## Activity Log
- `2026-03-02`: Initial detailed implementation plan created with granular parts and tracking fields.
- `2026-03-02`: Implemented App Router pages and navigation flow for `/login`, `/users`, `/users/[userId]`, and `/users/[userId]/invoices/[invoiceId]`.
- `2026-03-02`: Added API/auth/search/format utility layers with token handling, unauthorized redirects, and nullable-data formatting.
- `2026-03-02`: Added shared UI modules and consistent loading/error/empty states across pages.
- `2026-03-02`: Applied single-theme styling, responsive layout rules, and navbar/logout behavior.
- `2026-03-02`: Validation run completed with `npm run lint` and `npm run build`.

## Quick Update Template
Use this template each time progress changes:

```md
### Update - YYYY-MM-DD HH:mm
- Part: `Part XX - Name`
- Task: `short task description`
- Change: `started | completed | blocked`
- Notes: `short implementation note`
```
