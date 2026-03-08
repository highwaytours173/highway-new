# Hotel-First Experience Improvement Plan

This plan details the 5 phases to transform the application into a top-tier Single Hotel website builder, ensuring the Home Page and Search experience are optimized for hospitality.

## Phase 1: Data Modeling & Schema Updates

**Goal**: Extend the data structure to store hotel-specific content.

- Update `HomeContent` type in `src/types/index.ts` to include:
  - `hotelFeatures`: To store amenities (e.g., "Infinity Pool", "24/7 Room Service") replacing the tour-focused "Why Choose Us".
  - `featuredRooms`: Configuration to select which room types to highlight on the homepage.
  - `hotelStory`: A section for the hotel's "About" or "Welcome" message.
- Update `AgencySettings` to allow fine-tuning hotel search (e.g., max guests per search).

## Phase 2: Admin Editor Evolution

**Goal**: Empower hoteliers to manage their specific homepage content.

- Refactor `src/components/admin/home-page-editor/editor.tsx`.
- Add a **"Hotel Mode"** view in the editor that:
  - Hides tour-specific sections (Browse Categories, Tour Banners).
  - Shows editors for **Hotel Amenities** (Icon + Title + Description).
  - Shows a picker for **Featured Rooms**.
- Add configuration for the Hotel Hero Search (e.g., default guest counts).

## Phase 3: Advanced Hotel Search Component

**Goal**: Create a booking-engine-style search bar.

- Build `src/components/hotel-search-box.tsx`.
- Features:
  - Date Range Picker (Check-in / Check-out) with minimum stay validation.
  - Guest Selector (Adults & Children counters).
  - (Optional) Promo Code input.
- Ensure this component integrates seamlessly into the Hero section.

## Phase 4: Hotel-Specific Frontend Sections

**Goal**: Build the UI components that make the site look like a luxury hotel site.

- **`HotelFeaturesSection`**: A grid layout for amenities (Spa, Dining, Concierge).
- **`FeaturedRoomsSection`**: A card carousel or grid specifically for Room Types (showing "Sleeps X", "Bed Type", "Price from...").
- **`HotelStorySection`**: An elegant text + image section for the property introduction.

## Phase 5: Integration & Logic Switching

**Goal**: Automatically switch the entire homepage layout based on "Single Hotel Mode".

- Update `src/app/(main)/home-client.tsx`:
  - Check `settings.singleHotelMode`.
  - **IF True**:
    - Render `HotelSearchBox` in Hero.
    - Render `HotelFeaturesSection` instead of "Why Choose Us".
    - Render `FeaturedRoomsSection` instead of "Popular Tours" or generic "Featured Hotels".
    - Hide irrelevant sections (Tour Categories).
  - **IF False** (Tour/Hybrid Mode):
    - Keep existing behavior.

---

**Status**: Waiting for approval to begin Phase 1.
