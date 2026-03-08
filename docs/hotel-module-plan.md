# Hotel Module Plan (Tours + Hotels, or Either One)

## Context (Current App)

- Framework: Next.js App Router (Next 15) with Tailwind + shadcn/ui components
- Data/auth: Supabase (SSR + middleware session refresh)
- Tenancy: “Agency” is effectively the tenant; settings/content is fetched per current agency
- Admin: `/admin/*` with a sidebar whose items can be toggled via `settings.modules`

This plan adds a Hotels module in a way that supports:

- Tour agency only
- Hotel only
- Tour agency + hotel

## Goals

- Add Hotels to the admin dashboard (manage hotel profile, rooms, pricing, availability, bookings)
- Add Hotels to the public site (hotel pages + booking flow)
- Keep the UI clean for each tenant mode by hiding irrelevant modules
- Reuse the existing design system, layouts, and Supabase patterns

## Non-Goals (For MVP)

- Channel manager integrations (Booking.com/Expedia) and complex revenue management
- Multi-hotel per tenant (start with single hotel per tenant; expand later if needed)
- Advanced room allocation logic (keep it simple and correct first)

## Tenant Modes (How to “Look Perfect” in All Cases)

### Module Flags

Extend the existing `settings.modules` concept to support:

- `tours`: boolean
- `hotels`: boolean
- (existing) `blog`, `upsell`, `contact`

Rules:

- If `tours=false`, hide Tours-related public nav items and admin sidebar items, and remove tours sections from the home page.
- If `hotels=false`, hide Hotels-related nav items and admin sidebar items, and remove hotels sections from the home page.
- If both are true, show both and make the home page a combined “Travel + Stay” experience.

### Navigation

Use the existing “settings-driven navLinks” as the primary source of truth.
If navLinks aren’t configured, fall back to defaults that are generated from module flags:

- Tours-only: Home, Destination, Tours, Services, Blog, Contact
- Hotels-only: Home, Rooms, Availability/Offers, Blog (optional), Contact
- Both: Home, Tours, Hotels, Services, Blog, Contact

## Public Website Changes (MVP)

### Routes

Add public routes under `src/app/(main)`:

- `/hotels` (or `/stay`): hotel landing + highlights + search
- `/hotels/[slug]`: hotel details with rooms and booking widget
- Optional: `/rooms` if you want a direct rooms browsing page for hotels-only tenants

### Home Page Composition

Home is already CMS-driven (`homeContent`) and has visibility flags.
Extend home content with hotel sections and keep it modular:

- `visibility.hotelsHero` / `visibility.featuredRooms` / `visibility.hotelAmenities`
- `hotels.featuredRoomTypeIds` or `hotels.featuredRoomsCount`

Behavior by mode:

- Tours-only: existing home sections unchanged
- Hotels-only: show hotel hero + featured rooms + amenities + reviews; hide tours-specific sections
- Both: keep the hero/search capable of switching between “Tours” and “Rooms”

### UX Flow (Hotels)

MVP booking flow:

- User selects date range + guests on hotel details page
- System shows available room types with price per night (or total)
- User picks a room type and quantity (usually 1)
- Add to cart → checkout → booking confirmation

## Admin Dashboard Changes

### Sidebar / IA

Add an “Hotels” group or items inside “Management/Content”:

- Hotels
  - Hotel Profile (name, address, images, policies, check-in/out times)
  - Room Types (create/edit room types, images, capacity, amenities)
  - Availability & Rates (calendar-like editing)
  - Hotel Bookings (list + booking details)

Recommended admin routes (App Router):

- `/admin/hotels` (overview + profile)
- `/admin/hotels/rooms` (room types list)
- `/admin/hotels/rooms/[id]/edit`
- `/admin/hotels/availability` (calendar)
- `/admin/hotel-bookings` (or `/admin/hotels/bookings`)
- `/admin/hotels/settings` (optional)

### Admin UX (MVP)

- Room Types:
  - title, description, images, max adults, max children (optional), base occupancy
  - amenities (array of strings)
  - active/inactive
- Availability & Rates:
  - pick room type
  - edit date range (from/to)
  - set: available units, price per night, min nights (optional)
- Bookings:
  - status: pending, paid, confirmed, canceled
  - guest info, date range, total, payment reference

## Data Model (Supabase) — Recommended MVP

The current app already uses Supabase tables for tours/posts/bookings. For hotels, add tables that support date-based inventory and pricing.

### Core Tables

1. `hotels`

- `id` (uuid, pk)
- `agency_id` (uuid, fk to agencies/tenants table)
- `slug` (text, unique per tenant)
- `name`, `description`, `address`, `city`, `country`
- `check_in_time`, `check_out_time`
- `policies` (jsonb)
- `images` (text[] or jsonb)
- `is_active` (boolean)

2. `room_types`

- `id` (uuid, pk)
- `hotel_id` (uuid, fk)
- `slug` (text)
- `name`, `description`
- `max_adults`, `max_children` (optional)
- `beds` (jsonb)
- `amenities` (text[] or jsonb)
- `images` (text[] or jsonb)
- `is_active` (boolean)

3. `room_rate_plans` (optional for MVP; can be deferred)

- `id`, `room_type_id`
- `name` (e.g., “Refundable”, “Non-refundable”)
- `cancellation_policy` (jsonb)
- `is_active`

4. `room_inventory`
   This is the key for availability + pricing. One row per date per room type (or per date range using generated rows).

- `id` (uuid, pk)
- `room_type_id` (uuid, fk)
- `date` (date)
- `available_units` (int)
- `price_per_night` (numeric)
- `currency` (text) (or rely on tenant currency setting)
- `min_nights` (int, nullable)
- `stop_sell` (boolean, default false)

5. `hotel_bookings`

- `id` (uuid, pk)
- `agency_id` (uuid)
- `hotel_id` (uuid)
- `room_type_id` (uuid)
- `check_in` (date)
- `check_out` (date)
- `guests_adults`, `guests_children` (optional)
- `guest_name`, `guest_email`, `guest_phone` (optional; depending on your current checkout model)
- `status` (text enum)
- `payment_provider` (text), `payment_reference` (text)
- `subtotal`, `tax`, `fees`, `total` (numeric)
- `created_at`

### Inventory Rules (MVP)

- Availability for a booking is valid if every night in `[check_in, check_out)` has:
  - `stop_sell=false`
  - `available_units >= requested_units`
- When a booking is created/confirmed, decrement inventory for each night.
- If you need “pending” bookings, place a short-lived hold (see below) to avoid overselling.

### Holds (Optional, but Recommended)

Add `hotel_booking_holds`:

- `room_type_id`, `check_in`, `check_out`, `units`, `expires_at`
  Then compute effective availability = inventory - confirmed bookings - active holds.

## Cart + Checkout Integration

### Cart Item Types

Your current cart is tours-oriented. Evolve it to support multiple item types:

- `tour` item (existing)
- `hotel` item (new)
- `upsell` item (existing)

For hotel items, store:

- `hotelId`, `roomTypeId`
- `checkIn`, `checkOut`
- `guests`
- `units`
- `priceBreakdown` (optional cached quote)

### Quoting

Price should be recalculated server-side at checkout time to prevent stale pricing:

- compute total nights
- sum `price_per_night` from `room_inventory` rows
- apply promos if enabled
- compute final total

### Payment + Confirmation

Reuse your existing payment provider integration patterns (Kashier webhook exists).
MVP flow:

- user pays
- webhook confirms payment
- booking status changes to confirmed
- inventory decrement happens on confirmation (or on hold creation if you implement holds)

## Content & SEO

- Add per-hotel and per-room SEO fields into `hotels` (or reuse your existing `agency-content` SEO helper to generate titles/descriptions).
- Ensure metadata is tenant-aware (your root metadata already uses `getAgencySettings` / `getCurrentAgency`).

## Permissions & Security (Supabase RLS)

Recommended MVP security boundaries:

- Public: read-only access to `hotels`, `room_types`, and only “future” `room_inventory` that’s needed for pricing display
- Admin: tenant-scoped full CRUD via RLS policies and authenticated user checks
- Webhook/system: service-role used only server-side for booking confirmation and inventory updates

## Implementation Phases (Suggested Order)

### Phase 1 — Foundations

- Add module flag: `settings.modules.hotels` and `settings.modules.tours`
- Update admin sidebar filtering to support Hotels and Tours toggling
- Add tenant-aware hotel settings fields (contact/policies) if needed

### Phase 2 — Database & Server APIs

- Create Supabase tables: `hotels`, `room_types`, `room_inventory`, `hotel_bookings`
- Add minimal server functions in `src/lib/supabase/*` mirroring existing patterns
- Implement availability + quote calculation functions (server-side)

### Phase 3 — Admin UI (Hotels)

- Implement admin pages and forms:
  - hotel profile editor
  - room type CRUD
  - availability/rates calendar editor
  - bookings list + details
- Reuse existing `DataTable` patterns used in tours/promotions/bookings

### Phase 4 — Public UI (Hotels)

- Create public hotel landing and hotel details pages
- Add booking widget (date range + guests)
- Show available room types with computed totals

### Phase 5 — Checkout Integration

- Extend cart state to support hotel items
- Update checkout flow to:
  - re-quote server-side
  - create booking (pending/hold)
  - confirm via payment webhook
- Add booking confirmation page for hotels (and unify with tours success if desired)

### Phase 6 — QA, Hardening, Rollout

- Validate edge cases: timezone, date math, partial availability, cancellations
- Add automated tests for quote and availability logic
- Add admin feature flags rollout (enable hotels for selected tenants only)

## Acceptance Criteria (MVP)

- Hotels-only tenant:
  - Admin shows Hotels pages and hides Tours pages
  - Public home and navigation feel “hotel-first” and not tour-heavy
  - User can book a room for a date range and receive confirmation

- Tours-only tenant:
  - No Hotels links or sections visible
  - Existing flows remain unchanged

- Both enabled:
  - Admin shows both modules
  - Public home provides a clear way to browse both (sections or switcher)
  - Cart supports mixed items (tour + hotel) without breaking

## Key Files/Areas Likely to Change Later (When You Start Implementing)

- Public layouts and home composition:
  - `src/app/(main)/layout.tsx`
  - `src/app/(main)/page.tsx`
  - `src/app/(main)/home-client.tsx`
- Admin sidebar and routes:
  - `src/components/admin/admin-sidebar.tsx`
  - `src/app/admin/*`
- Cart and checkout:
  - `src/hooks/use-cart.tsx`
  - `src/app/(main)/checkout/*`
- Supabase data access:
  - `src/lib/supabase/*`
