# Refactoring Plan: Hotel & Tour Agency Support

This plan outlines the changes required to support three business modes: **Hotel-Only**, **Tour-Only**, and **Hybrid (Hotel + Tours)**. It also addresses the "Single Hotel" use case.

## 1. Configuration & Settings

We will update the `AgencySettings` to explicitly control the business mode and features.

### New Settings

- **`modules.tours` (boolean)**: Enable/Disable Tour features.
- **`modules.hotels` (boolean)**: Enable/Disable Hotel features.
- **`singleHotelMode` (boolean)**:
  - If `true`: The website represents a single hotel property. The "Hotels" page will display rooms directly or redirect to the single hotel's details.
  - If `false`: The website is a directory/OTA style, listing multiple hotels.

## 2. Admin Dashboard Enhancements

### Settings Page Update

- Add a new "Business Configuration" section in the Admin Settings.
- **Toggles**:
  - "Enable Tours" (Toggle `modules.tours`)
  - "Enable Hotels" (Toggle `modules.hotels`)
  - "Single Hotel Website" (Toggle `singleHotelMode`)

### Sidebar & Navigation Logic

- **Admin Sidebar**:
  - Hide "Tours" menu if `modules.tours` is OFF.
  - Hide "Hotels" menu if `modules.hotels` is OFF.
- **Public Navigation**:
  - If `modules.tours` is OFF -> Remove "Tours" link.
  - If `modules.hotels` is OFF -> Remove "Hotels" link.
  - If `singleHotelMode` is ON -> Rename "Hotels" to "Rooms" or "Our Stay" and link directly to the hotel's room listing or details page.

## 3. Home Page Architecture

The Home Page will adapt based on the active modules.

### Hero Section

- **Hotel-Only Mode**:
  - Default Search: Check-in / Check-out / Guests.
  - Title/Subtitle defaults to Hotel branding.
- **Tour-Only Mode**:
  - Default Search: Destination / Tour Type.
  - Title/Subtitle defaults to Tour branding.
- **Hybrid Mode**:
  - Default Search: Tabs for "Stays" and "Experiences" (User can switch).
  - Admin can choose which tab is active by default.

### Featured Sections

- **Hotel-Only**:
  - Display "Our Rooms" or "Suites" instead of "Popular Destinations".
  - Show "Hotel Amenities" or "Services".
- **Tour-Only**:
  - Display "Popular Tours", "Destinations", "Last Minute Offers".
- **Hybrid**:
  - Show a mix of "Featured Tours" and "Top Rated Stays".

## 4. "Single Hotel" Page Flow

If `singleHotelMode` is active:

- **Route `/hotels`**:
  - Instead of listing multiple hotels, this route will either:
    1. Redirect to `/hotels/[slug]` (The single hotel's detail page).
    2. Or render the "Rooms" list of that single hotel directly.
- **Hotel Details Page**:
  - If it's a single hotel website, the "Hotel Details" page effectively becomes the "About" or "Accommodation" page. We might want to streamline the layout to look less like a directory listing and more like a brand site.

## 5. Implementation Steps

1.  **Database/Types**: Update `AgencySettings` type definition to include `singleHotelMode`.
2.  **Admin UI**: Create/Update the Settings form to toggle these modes.
3.  **Navbar Component**: Update `Navbar` to conditionally render links based on settings.
4.  **Home Page Logic**: Update `HomePage` server component to read settings and pass them to `HomeClient`.
5.  **Home Client**: Refactor `HomeClient` to conditionally render sections and search bars based on the passed settings.

---

**Status**: Waiting for approval.
