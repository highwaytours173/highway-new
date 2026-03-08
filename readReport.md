# tix and trips egypt – Technical Assessment and Development Plan

## Executive Summary

tix and trips egypt is a Next.js 15 application with a modern App Router architecture, Tailwind CSS styling, Shadcn UI components, and Supabase for data and storage. The product already provides core browsing and booking experiences for tours, a shopping cart and checkout flow that creates bookings (without payments), an admin panel for managing tours, bookings, customers (derived), upsell items, a dashboard with analytics, and AI features for cart suggestions and blog post generation.

Key gaps remain around production-grade data persistence for CMS features (blog, homepage, settings), robust authentication/authorization (admin roles), payment integration (Stripe), and comprehensive security (RLS policies). This plan defines functional requirements, technical specifications, and a roadmap to achieve a production-ready release.

## Technology Stack Overview

- Framework: Next.js 15 (App Router)
- Styling/UI: Tailwind CSS + Shadcn UI
- Data/Storage: Supabase (Postgres + Storage) with SSR and browser clients
- Charts: Recharts
- AI: Genkit with Google AI (Gemini 2.0 Flash), flows for tour suggestions and blog generation

## Current Feature Inventory

Public-facing

- Homepage with hero search, categories, last-minute offers, testimonials, articles
- Tours listing page and tour details page (dynamic, SSR data from Supabase)
- Search results page with filters by query, destination, type
- Wishlist (client-side)
- Cart with upsell suggestions and AI-powered alternative tour recommendations
- Checkout form (Zod-validated) with booking creation and success page

Admin Panel

- Authentication page (email/password via Supabase)
- Dashboard with revenue/bookings/customers metrics, date range picker, charts and recent sales
- Tours CRUD with image uploads to Supabase storage
- Bookings list/detail with status updates and delete
- Customers list from derived data (bookings + mock newsletters)
- Upsell items CRUD (image uploads into tours bucket) and listing
- Blog management list and editor with AI content generator (mock data only; not persisted)
- Home page editor form (mock data only; not persisted)
- Settings page (mock data only; not persisted)

## Functional Requirements and Gap Analysis

Must-have functions

1. Tour Management
   - Create/read/update tours, upload images, manage detailed attributes (itinerary, includes/excludes).
   - Search & filter tours by destination/type.
2. Booking & Checkout
   - Cart with tours and upsell items; compute tiered pricing.
   - Checkout with customer details; payment via Stripe; booking confirmation on successful payment.
   - Email notifications to customers (confirmation/cancellation).
3. Customer Management
   - Persist customer records; view customer profiles and bookings; export list.
4. Admin Authentication/Authorization
   - Only admin users can access admin routes and perform CRUD on privileged tables.
5. CMS Features
   - Blog posts persisted in database with public-facing blog pages.
   - Home page content and settings stored in database; admin editor updates persist.
6. Analytics & Reporting
   - Dashboard metrics sourced from live data (revenue, bookings, customers, active tours).

Identified gaps

- Payments: No Stripe integration; bookings complete without payment.
- AuthZ: Admin role not enforced; middleware checks only session presence.
- CMS persistence: Blog, Home page editor, Settings use mock data and onSubmit logs.
- Customers: Derived from bookings + mock data, not persisted.
- Security: No explicit RLS policies documented for Supabase tables; server actions use anon key—policy enforcement is critical.
- Webhooks: No Stripe webhook handler to confirm bookings.

## Proposed Data Model (Supabase)

Tables use snake_case to align with existing server actions.

1. tours

- id uuid primary key default gen_random_uuid()
- slug text unique not null
- name text not null
- destination text not null
- type text[] not null
- duration integer not null
- description text not null
- itinerary jsonb not null default '[]'::jsonb
- availability boolean not null default true
- images text[] not null default '{}'::text[]
- rating numeric(2,1) not null default 4.5
- price_tiers jsonb not null
- duration_text text
- tour_type text
- availability_description text
- pickup_and_dropoff text
- highlights text[]
- includes text[]
- excludes text[]
- cancellation_policy text
- created_at timestamptz not null default now()

2. upsell_items

- id uuid primary key default gen_random_uuid()
- name text not null
- description text
- price numeric(10,2) not null
- type text not null check (type in ('service','tour_addon'))
- related_tour_id uuid references tours(id) on delete set null
- image_url text
- is_active boolean not null default true
- created_at timestamptz not null default now()

3. bookings

- id uuid primary key default gen_random_uuid()
- customer_name text not null
- customer_email text not null
- phone_number text
- nationality text
- booking_date timestamptz not null default now()
- total_price numeric(10,2) not null
- status text not null check (status in ('Confirmed','Pending','Cancelled')) default 'Pending'
- user_id uuid references auth.users(id) on delete set null
- created_at timestamptz not null default now()

4. booking_items

- id uuid primary key default gen_random_uuid()
- booking_id uuid not null references bookings(id) on delete cascade
- tour_id uuid references tours(id) on delete set null
- upsell_item_id uuid references upsell_items(id) on delete set null
- adults integer not null default 0
- children integer not null default 0
- item_date date
- price numeric(10,2) not null
- created_at timestamptz not null default now()

5. customers (optional but recommended for CRM)

- id uuid primary key default gen_random_uuid()
- user_id uuid references auth.users(id) unique
- name text not null
- email text not null unique
- source text not null check (source in ('Booking','Newsletter','Manual'))
- created_at timestamptz not null default now()

6. posts (for blog)

- id uuid primary key default gen_random_uuid()
- slug text unique not null
- title text not null
- content text not null
- author text not null
- status text not null check (status in ('Published','Draft')) default 'Draft'
- featured_image text
- tags text[] not null default '{}'::text[]
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

7. home_page_content (single row or per-section rows)

- id uuid primary key default gen_random_uuid()
- content jsonb not null
- updated_at timestamptz not null default now()

8. admin_users (for RBAC)

- user_id uuid primary key references auth.users(id) on delete cascade
- created_at timestamptz not null default now()

Storage

- Bucket: tours (existing) for tour and upsell images; consider separate bucket `cms` for homepage/blog featured images.

## Security and Authorization (Supabase RLS)

Enable RLS on all tables. Example policies:

Helper function

```sql
create or replace function public.current_user_is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  );
$$;
```

Tours

```sql
alter table public.tours enable row level security;
create policy "Public read tours" on public.tours for select using (true);
create policy "Admins manage tours" on public.tours for all using (public.current_user_is_admin());
```

Upsell Items

```sql
alter table public.upsell_items enable row level security;
create policy "Public read upsell" on public.upsell_items for select using (true);
create policy "Admins manage upsell" on public.upsell_items for all using (public.current_user_is_admin());
```

Bookings

```sql
alter table public.bookings enable row level security;
-- Anyone can insert a booking (anonymous checkout) or authenticated users
create policy "Anyone can create bookings" on public.bookings for insert with check (true);
-- Only admins can select all bookings; users can read their own
create policy "Admins read bookings" on public.bookings for select using (public.current_user_is_admin());
create policy "Users read own bookings" on public.bookings for select using (user_id = auth.uid());
-- Only admins can update/delete bookings
create policy "Admins modify bookings" on public.bookings for update using (public.current_user_is_admin());
create policy "Admins delete bookings" on public.bookings for delete using (public.current_user_is_admin());
```

Booking Items

```sql
alter table public.booking_items enable row level security;
create policy "Insert booking items with any role" on public.booking_items for insert with check (true);
-- Read: admins or users tied to parent booking
create policy "Admins read booking items" on public.booking_items for select using (public.current_user_is_admin());
create policy "Users read own booking items" on public.booking_items for select using (
  exists (
    select 1 from public.bookings b where b.id = booking_items.booking_id and b.user_id = auth.uid()
  )
);
-- Update/Delete: admins only
create policy "Admins modify booking items" on public.booking_items for update using (public.current_user_is_admin());
create policy "Admins delete booking items" on public.booking_items for delete using (public.current_user_is_admin());
```

Posts

```sql
alter table public.posts enable row level security;
create policy "Public read published posts" on public.posts for select using (status = 'Published');
create policy "Admins read all posts" on public.posts for select using (public.current_user_is_admin());
create policy "Admins manage posts" on public.posts for all using (public.current_user_is_admin());
```

Home Page Content

```sql
alter table public.home_page_content enable row level security;
create policy "Public read homepage" on public.home_page_content for select using (true);
create policy "Admins manage homepage" on public.home_page_content for all using (public.current_user_is_admin());
```

Admin Middleware

- Update Next.js middleware to enforce admin-only access to /admin routes:

```ts
// src/middleware.ts (excerpt)
if (pathname.startsWith('/admin/') && pathname !== '/admin') {
  if (!session) redirectTo('/admin');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.is_admin === true; // or fetch from admin_users via RPC
  if (!isAdmin) redirectTo('/');
}
```

Alternatively, store admin membership in `admin_users` table and check it via an RPC.

## Payment Integration (Stripe)

Environment

- STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET

Server-side Stripe client

```ts
// src/lib/stripe.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
```

Checkout route handler

```ts
// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createBooking } from '@/lib/supabase/bookings';

export async function POST(req: Request) {
  const body = await req.json();
  const { customer, cartItems, successUrl, cancelUrl } = body;

  // Transform cart items to Stripe line items
  const line_items = cartItems.map((item: any) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: Math.round(item.unitPrice * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customer.email,
    line_items,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { payload: JSON.stringify({ customer, cartItems }) },
  });

  return NextResponse.json({ id: session.id, url: session.url });
}
```

Webhook handler to confirm bookings

```ts
// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createBooking } from '@/lib/supabase/bookings';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const buf = Buffer.from(await req.arrayBuffer());
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { customer, cartItems } = JSON.parse(session.metadata.payload);
    const totalPrice = session.amount_total / 100;
    await createBooking({
      customerName: customer.name,
      customerEmail: customer.email,
      phoneNumber: customer.phone,
      nationality: customer.nationality,
      cartItems,
      totalPrice,
    });
  }

  return NextResponse.json({ received: true });
}
```

Checkout page integration

- Replace direct createBooking call with POST to /api/checkout and redirect to session URL.

## API and Server Actions

Existing server actions

- getTours, getTourBySlug, addTour, updateTour
- getBookings, getBookingById, updateBookingStatus, deleteBooking, createBooking
- getUpsellItems, getUpsellItemById, addUpsellItem, updateUpsellItem, deleteUpsellItem
- getAiSuggestions, generateBlogPostAction (actions.ts)

Proposed additions

- savePost, deletePost, getPostBySlug (Supabase-backed)
- getHomepageContent, updateHomepageContent
- getSettings, updateSettings
- getCustomers, getCustomerById (persisted table)
- Stripe checkout route & webhook

## Testing and Quality Assurance

- Unit tests: price tier calculations, booking item totals, RLS policy expectations (via supabase-js).
- Integration tests: server actions for tours/bookings/upsell items.
- E2E tests: Playwright flows for browsing, adding to cart, checkout, admin CRUD.
- Linting and type checking enforced locally; CI can tolerate build errors initially but should be tightened before release.

## Deployment & Configuration

- Hosting: Vercel or similar for Next.js; Supabase for DB and storage.
- Environment variables: Supabase URL and keys, Stripe keys, webhook secret.
- Image domains configured in next.config.ts (already includes Supabase storage and Unsplash).
- Revalidation: keep using revalidatePath after mutations.

## Development Roadmap

Phase 1 – Foundations (Security, Auth, CMS persistence)

- Implement admin RBAC (admin_users table, middleware checks, RLS policies).
- Convert blog to persisted posts table; build public blog pages and admin CRUD.
- Implement home_page_content table; wire up Home Page Editor and Settings to Supabase.
- Add customers table and wire admin customers page to live data.

Phase 2 – Payments and Booking Enhancements

- Integrate Stripe checkout route and webhook.
- Update checkout flow to use Stripe session; persist bookings on webhook.
- Email notifications on booking confirmation/cancellation.

Phase 3 – UX, Search, and Analytics

- Improve tours search/filter UX; server-side filtering by query/destination/type.
- Enhance dashboard metrics using live aggregates from bookings and customers.
- Polish tour details page and itinerary management.

Phase 4 – QA and Release Prep

- Implement unit/integration/E2E tests.
- Harden security (audit RLS, env handling, error logs).
- Performance (SSR where appropriate, caching, image optimization).

## Estimated Timeline

- Phase 1: 1.5–2 weeks
- Phase 2: 1.5–2 weeks
- Phase 3: 1 week
- Phase 4: 1 week
  Total: ~5–7 weeks, depending on scope and revision cycles.

## Risks and Mitigations

- RBAC complexity: Mitigate with a simple admin_users table and helper function.
- Payment reliability: Use Stripe webhooks + idempotency; thorough testing.
- Data consistency: Apply foreign keys and cascading rules; write integration tests.
- AI content accuracy: Keep AI output moderated by editor before publishing.

## Actionable Next Steps

1. Create the Supabase tables (DDL above) and enable RLS with policies.
2. Add admin_users entries and middleware checks for /admin.
3. Persist blog, homepage, and settings into Supabase; add server actions.
4. Integrate Stripe checkout and webhook; refactor checkout.
5. Update customers to persisted table; wire admin customers list.
6. Add tests and CI.
7. Prepare deployment config and environment variables.

## Phase 1 Progress Update

Overview

- Admin RBAC and middleware protections are in place for all /admin routes.
- Blog is now persisted via Supabase (with a fallback to mock data), including admin CRUD and public pages.
- Home Page Editor and Admin Settings now load/save data from Supabase.
- Customers list in Admin fetches from Supabase with a graceful fallback.
- Next.js dev server is running and UI changes have been previewed locally.

Key Code Changes

- src/middleware.ts: Enforce admin-only access on /admin/\* using Supabase session + user metadata or admin_users membership.
- src/lib/supabase/blog.ts: Supabase-backed data layer for posts (getPosts, getPostBySlug, upsertPost, deletePostBySlug) with fallback to src/lib/blog.ts.
- src/app/admin/blog/page.tsx: Switched to async server component using Supabase getPosts().
- src/app/admin/blog/[slug]/edit/page.tsx: Editor now loads/saves posts to Supabase; supports image upload to the 'blog' storage bucket.
- src/app/blog/page.tsx and src/app/blog/[slug]/page.tsx: New public-facing blog listing and post pages.
- src/components/admin/home-page-editor/editor.tsx: Integrated Supabase (home_page_content singleton row) for loading and persisting.
- src/app/admin/settings/page.tsx: Integrated Supabase (settings table) and logo upload to 'cms' storage bucket.
- src/lib/supabase/customers.ts and src/app/admin/customers/page.tsx: Supabase-backed customers list with fallback to mock data.

Schema Notes (Recommended)

- Admin membership
  - Table: public.admin_users (user_id uuid primary key, created_at timestamptz default now())
  - Helper SQL function: public.current_user_is_admin() returns boolean, checks admin_users for auth.uid().

- Posts
  - Table: public.posts
    - id uuid default gen_random_uuid() primary key
    - slug text unique not null
    - title text not null
    - author text not null
    - content text
    - status text check (status in ('Draft','Published')) default 'Draft'
    - featured_image_url text
    - created_at timestamptz default now()
    - updated_at timestamptz default now()

- Home Page Content (singleton)
  - Table: public.home_page_content
    - id integer primary key default 1 check (id = 1)
    - data jsonb not null
    - updated_at timestamptz default now()

- Settings (singleton)
  - Table: public.settings
    - id integer primary key default 1 check (id = 1)
    - data jsonb not null
    - logo_url text
    - updated_at timestamptz default now()

- Customers
  - Table: public.customers
    - id uuid default gen_random_uuid() primary key
    - name text not null
    - email text not null
    - phone text
    - nationality text
    - created_at timestamptz default now()

RLS Policies (Recommended)
-- Helper function

```sql
create or replace function public.current_user_is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;
```

-- Posts

```sql
alter table public.posts enable row level security;
create policy "Public read published posts" on public.posts for select using (status = 'Published');
create policy "Admins read all posts" on public.posts for select using (public.current_user_is_admin());
create policy "Admins manage posts" on public.posts for all using (public.current_user_is_admin());
```

-- Home Page Content

```sql
alter table public.home_page_content enable row level security;
create policy "Public read homepage" on public.home_page_content for select using (true);
create policy "Admins manage homepage" on public.home_page_content for all using (public.current_user_is_admin());
```

-- Settings

```sql
alter table public.settings enable row level security;
create policy "Public read settings" on public.settings for select using (true);
create policy "Admins manage settings" on public.settings for all using (public.current_user_is_admin());
```

-- Customers

```sql
alter table public.customers enable row level security;
create policy "Admins read customers" on public.customers for select using (public.current_user_is_admin());
create policy "Admins manage customers" on public.customers for all using (public.current_user_is_admin());
```

Storage Buckets

- Create bucket 'blog' for post featured images. Public read is acceptable for published images; restrict writes to admins.
- Create bucket 'cms' for site assets (e.g., logo). Public read is acceptable; restrict writes to admins.
- Add storage policies accordingly, for example:

```sql
-- Example storage policy for public read
create policy "Public read blog images" on storage.objects for select using (
  bucket_id = 'blog'
);
-- Admins can manage blog images
create policy "Admins manage blog images" on storage.objects for all using (
  bucket_id = 'blog' and public.current_user_is_admin()
);
```

Operational Notes

- Next.js dev server started on port 9010 with Turbopack for preview.
- Image domains should include Supabase storage and Unsplash in next.config.js.
- Fallback logic ensures mock data is used if Supabase is unreachable or tables are not yet created.

Remaining Phase 1 Follow-ups

- Ensure the recommended tables and RLS policies are created in Supabase.
- Verify storage bucket policies for 'blog' and 'cms'.
- Add uniqueness constraint for posts.slug and optional index for status.
- Confirm revalidation paths are triggered on mutations where relevant.
