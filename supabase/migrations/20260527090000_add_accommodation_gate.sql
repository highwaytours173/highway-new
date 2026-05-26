-- Tailor-Made accommodation gating.
-- Agencies that don't book hotels (or don't have inventory loaded into the
-- system) should not have the AI guide suggest accommodation tiers or list
-- specific hotels in the generated itinerary. Two new columns:
--
--   handles_accommodation  → master toggle, defaults FALSE for safety so a
--                            freshly-bootstrapped agency doesn't pitch hotels
--                            it can't actually book.
--   accommodation_notes    → free-text inventory + pricing the AI sees as
--                            context when the toggle is ON.

ALTER TABLE public.agency_tailor_made_config
  ADD COLUMN IF NOT EXISTS handles_accommodation BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.agency_tailor_made_config
  ADD COLUMN IF NOT EXISTS accommodation_notes TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.agency_tailor_made_config.handles_accommodation IS
  'When TRUE, the AI guide asks about accommodation comfort and the generator recommends hotels. When FALSE, accommodation is set to "Self-arranged" and the AI skips the question entirely.';

COMMENT ON COLUMN public.agency_tailor_made_config.accommodation_notes IS
  'Free-text hotel inventory + pricing surfaced to the generator when handles_accommodation is TRUE. Empty string when unused.';
