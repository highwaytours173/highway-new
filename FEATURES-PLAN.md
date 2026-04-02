# Features Implementation Plan

_Last updated: April 2, 2026_

---

## Reality Check — What's Already Built

Before diving in, a full code audit revealed several features are **already implemented** in the codebase. The plan below focuses only on the actual missing/incomplete pieces.

| Feature                                                             | Status After Audit                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| Email: sending utility (Resend)                                     | ✅ Done — `src/lib/email/index.ts`                     |
| Email: 3 HTML templates (confirmation, admin alert, status change)  | ✅ Done — `src/lib/email/templates/`                   |
| Email: sent on `createBooking`                                      | ✅ Done — `src/lib/supabase/bookings.ts` step 7        |
| Email: sent on `updateBookingStatus`                                | ✅ Done — `src/lib/supabase/bookings.ts`               |
| Email: agency settings UI (Resend API key, from name/email, toggle) | ✅ Done — `src/app/admin/settings/page.tsx`            |
| PDF voucher component                                               | ✅ Done — `src/lib/pdf/booking-voucher.tsx`            |
| PDF API route (`/api/bookings/[id]/voucher`)                        | ✅ Done — `src/app/api/bookings/[id]/voucher/route.ts` |
| PDF download button on customer success page                        | ✅ Done — `src/app/(main)/checkout/success/page.tsx`   |
| PDF download button on admin booking detail                         | ✅ Done — `src/app/admin/bookings/[id]/page.tsx`       |
| CSV export button on admin bookings list                            | ✅ Done — `src/app/admin/bookings/bookings-client.tsx` |
| Mobile sticky "Book Now" bar on tour detail                         | ✅ Done — `src/components/tour-details-client.tsx`     |
| Some trust elements on checkout (ShieldCheck, step indicators)      | ⚠️ Partial                                             |
| In-app admin notification bell                                      | ❌ Missing                                             |

---

## Feature 1 — Email Notifications (Verify & Polish)

### What Still Needs Work

The infrastructure exists but has never been formally tested end-to-end. There are also small gaps:

- **No "Send Test Email" button** in admin settings → agencies can't verify their API key works before going live
- **Status change email** only fires for `Confirmed` / `Cancelled` — not for `Pending` (which is useful after Kashier payment returns)
- **Email send failures are fully silent** to the admin — if no API key is configured, the admin never knows
- **No email preview** — agency owners can't see what the emails look like before enabling them

### Tasks

- [ ] **1.1** Add a "Send Test Email" button to the Email Settings section in `/admin/settings/page.tsx` — it should call a server action that sends a sample email to the agency's `contactEmail` and returns success/failure feedback
- [ ] **1.2** Create the `sendTestEmail` server action in `src/lib/supabase/agency-content.ts` (or a new `src/app/admin/settings/actions.ts`)
- [ ] **1.3** Add a "Pending Payment" email variant to `booking-status-change.ts` template — or update `createBooking` to also send an email when payment method is `online` (status = Pending)
- [ ] **1.4** Show a warning banner in admin settings if `contactEmail` is set but no `resendApiKey` and no `RESEND_API_KEY` env var is detected

---

## Feature 2 — PDF Invoice (Verify & Add Download to Bookings Table)

### What Still Needs Work

The API route and download buttons exist. The gaps are:

- **No "Download PDF" in the bookings list table** (the `columns.tsx` action dropdown has no download option — you have to click into the booking detail first)
- **PDF might fail if `@react-pdf/renderer` is not installed** — needs to be verified
- **Customer success page only shows the download button when `paymentState === 'confirmed'`** — customers who pay by cash (also confirmed) do see it, but needs a smoke test
- **PDF has no "Paid" stamp** — a visual confirmation mark when `status === 'Confirmed'` and `paymentMethod === 'online'`

### Tasks

- [ ] **2.1** Verify `@react-pdf/renderer` is in `package.json` and the API route works (run `npm ls @react-pdf/renderer`)
- [ ] **2.2** Add a "Download Invoice" action to `src/app/admin/bookings/columns.tsx` dropdown menu — links to `/api/bookings/${booking.id}/voucher` with `download` attribute
- [ ] **2.3** Add a "Paid" green stamp/badge to `src/lib/pdf/booking-voucher.tsx` when status is `Confirmed` and payment method is `online`

---

## Feature 3 — CSV Export (Enhance Columns)

### What Still Needs Work

The export button exists and works but only exports 6 basic columns. Agency owners need the full picture for accounting and operations.

**Current columns:** ID, Customer Name, Email, Date, Status, Total Price  
**Missing:** Phone, Nationality, Payment Method, Items (comma-separated tour names), Discount Amount

### Tasks

- [ ] **3.1** Update the `handleExport` function in `src/app/admin/bookings/bookings-client.tsx` to include: Phone, Nationality, Payment Method, Discount Amount, Booking Items (joined as a string)
- [ ] **3.2** Add the export button also to the admin **booking detail** page (`/admin/bookings/[id]`) as a single-row export (nice to have, PDF already there, but some accountants want CSV)
- [ ] **3.3** BOM-prefix the CSV file content (`\uFEFF`) so it opens correctly in Excel / Arabic Windows systems without encoding issues

---

## Feature 4 — In-App Admin Notifications (New Feature)

### What Still Needs Work

This is a **genuinely missing feature**. Email to admin on new booking works, but:

- There is no **notification bell** in the admin header/sidebar
- Admin has no way to see unread booking count without navigating to /admin/bookings
- There is no **notifications table** in the DB to track read/unread state

### Design Decision

Keep it simple: **no database table needed**. Use a "pending bookings count badge" on the admin sidebar nav item as a live indicator. This is reliable, zero-infrastructure, and immediately useful.

### Tasks

- [ ] **4.1** Add a server-side `getPendingBookingsCount()` function to `src/lib/supabase/bookings.ts` that returns the count of `status = 'Pending'` bookings for the current agency
- [ ] **4.2** Update the admin layout (`src/app/admin/layout.tsx`) to fetch `pendingBookingsCount` and pass it to the sidebar
- [ ] **4.3** Update `src/components/admin/admin-sidebar.tsx` to accept and render a `pendingCount` badge on the "Bookings" nav item (red dot or count badge)
- [ ] **4.4** Wrap the count fetch in a `Suspense` boundary so it doesn't block the admin layout render

---

## Feature 5 — Trust Badges on Checkout (Improve Existing)

### What Still Needs Work

The checkout page has a `ShieldCheck` icon and a small "Secure Checkout" label in the header area. What's missing is a **dedicated, prominent trust strip** visible just before the "Place Order / Pay" button — the highest-anxiety moment for the customer.

Current trust elements are subtle and scattered. The goal is a consolidated visual block.

### New Trust Badge Section Design

A horizontal strip with 4 badges:

- 🔒 **SSL Secured** — "Your data is protected"
- ✅ **Instant Confirmation** — "Booking confirmed immediately"
- 🔄 **Flexible Cancellation** — "Check tour policy"
- 💬 **24/7 Support** — "We're here to help"

### Tasks

- [ ] **5.1** Create a `TrustBadges` component at `src/components/trust-badges.tsx` — a responsive row of 4 icon+text badges
- [ ] **5.2** Insert `TrustBadges` into the checkout page (`src/app/(main)/checkout/page.tsx`) between the payment method selector and the "Place Order" button
- [ ] **5.3** Also insert a smaller 2-badge version (`SSL Secured` + `Instant Confirmation`) at the top of the Order Summary sidebar card

---

## Feature 6 — Mobile Sticky "Book Now" (Already Done ✅)

The mobile sticky bottom bar is fully implemented in `src/components/tour-details-client.tsx` (around line 543). It shows:

- Price display (from price before date is selected, total after)
- "Book Now · N people" CTA button
- Fixed bottom with blur backdrop

**No work needed.**

---

## Implementation Order

Work on features in this order — each should be built, tested, and committed before moving to the next:

| #   | Feature                            | Effort         | Priority                                          |
| --- | ---------------------------------- | -------------- | ------------------------------------------------- |
| 1   | CSV Export Enhancement             | Small (30 min) | High — agencies use this immediately              |
| 2   | PDF in Bookings Table + Paid stamp | Small (1 hr)   | High — completes the PDF feature                  |
| 3   | Email Test Button                  | Medium (2 hr)  | High — enables agencies to self-serve email setup |
| 4   | Trust Badges on Checkout           | Small (1 hr)   | Medium — conversion improvement                   |
| 5   | In-App Pending Notifications Badge | Medium (2 hr)  | Medium — daily admin UX                           |
| 6   | Email Pending Status Variant       | Small (30 min) | Low — nice to have                                |

---

## Checklist Summary

### Feature 1 — Email Notifications

- [x] 1.1 — "Send Test Email" button in settings UI
- [x] 1.2 — `sendTestEmail` server action
- [x] 1.3 — Pending payment email variant
- [x] 1.4 — Warning banner if email not configured

### Feature 2 — PDF Invoice

- [x] 2.1 — Verify `@react-pdf/renderer` installed & API route works
- [x] 2.2 — Download Invoice in bookings table action dropdown
- [x] 2.3 — "Paid" stamp on PDF when confirmed

### Feature 3 — CSV Export

- [x] 3.1 — Enhance CSV columns (phone, nationality, payment method, items, discount)
- [x] 3.2 — Single booking CSV export on detail page (optional)
- [x] 3.3 — BOM prefix for Excel compatibility

### Feature 4 — In-App Notifications

- [x] 4.1 — `getPendingBookingsCount()` function
- [x] 4.2 — Fetch count in admin layout
- [x] 4.3 — Pending badge on sidebar Bookings nav item
- [x] 4.4 — Suspense boundary for non-blocking render

### Feature 5 — Trust Badges

- [x] 5.1 — `TrustBadges` component
- [x] 5.2 — Trust strip in checkout before Place Order button
- [x] 5.3 — Mini trust badges in Order Summary sidebar

### Feature 6 — Mobile Sticky CTA

- [x] ~~Already done~~
