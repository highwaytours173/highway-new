-- Tailor-Made Studio: per-agency configuration for the /tailor-made page.
-- Walkthrough is the only visitor entry mode (no form mode), so this table
-- focuses on what the agency exposes to the AI guide + how output renders.

CREATE TABLE IF NOT EXISTS public.agency_tailor_made_config (
  agency_id UUID PRIMARY KEY REFERENCES public.agencies(id) ON DELETE CASCADE,

  -- Master switch.
  enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Page copy (i18n later if needed).
  hero_title TEXT NOT NULL DEFAULT 'Tailor Made Your Tour',
  hero_subtitle TEXT NOT NULL DEFAULT
    'Tell our AI travel expert what kind of trip you''re after — we''ll handle the rest.',

  -- Option lists referenced by walkthrough questions via `optionsSource`.
  -- Each entry is { id?: string, label: string, description?: string }.
  regions JSONB NOT NULL DEFAULT '[]'::JSONB,
  interests JSONB NOT NULL DEFAULT '[]'::JSONB,
  inclusions JSONB NOT NULL DEFAULT '[]'::JSONB,
  accommodation_tiers JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Walkthrough spine — ordered list of questions the AI must collect.
  -- See docs/tailor-made-v2-plan.md §6.2 for the shape.
  walkthrough_questions JSONB NOT NULL DEFAULT '[]'::JSONB,
  walkthrough_persona TEXT NOT NULL DEFAULT '',

  -- Output enrichment toggles.
  output_enrichment JSONB NOT NULL DEFAULT '{
    "why_we_picked": true,
    "what_to_bring": false,
    "cultural_notes": false,
    "restaurant_picks": false,
    "alternative_options": false,
    "local_phrases": false
  }'::JSONB,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.agency_tailor_made_config IS
  'Per-agency configuration for the tailor-made walkthrough page (option lists, walkthrough script, output enrichment).';

ALTER TABLE public.agency_tailor_made_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agency members read own tailor-made config"
  ON public.agency_tailor_made_config;
CREATE POLICY "Agency members read own tailor-made config"
  ON public.agency_tailor_made_config FOR SELECT
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Agency members write own tailor-made config"
  ON public.agency_tailor_made_config;
CREATE POLICY "Agency members write own tailor-made config"
  ON public.agency_tailor_made_config FOR ALL
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_users WHERE user_id = auth.uid())
  );

-- Public-readable slice (the only things the public site needs to decide
-- whether to render the page + with what copy). Persona / option lists /
-- walkthrough spine stay server-only.
CREATE OR REPLACE VIEW public.agency_tailor_made_public AS
  SELECT agency_id, enabled, hero_title, hero_subtitle
  FROM public.agency_tailor_made_config;

GRANT SELECT ON public.agency_tailor_made_public TO anon, authenticated;
