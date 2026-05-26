-- Tailor-made booking requests: when a visitor likes a generated itinerary
-- they hit "Request to book" and submit name/email/phone + the itinerary
-- snapshot for the agency to follow up on.

CREATE TABLE IF NOT EXISTS public.tailor_made_booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,

  -- Contact info supplied by the visitor.
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',

  -- Frozen snapshots so the request is intelligible months later, even if
  -- the visitor went back and tweaked their itinerary.
  tour_input JSONB NOT NULL,
  tour_output JSONB NOT NULL,

  -- Agency-side triage.
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'closed', 'spam')),

  -- Light forensics for spam triage / rate-limiting follow-up.
  user_agent TEXT,
  ip_hash TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tmbr_agency_created
  ON public.tailor_made_booking_requests(agency_id, created_at DESC);

COMMENT ON TABLE public.tailor_made_booking_requests IS
  'Visitor-submitted booking requests for tailor-made itineraries. Agency follows up out-of-band (email / phone / WhatsApp).';

ALTER TABLE public.tailor_made_booking_requests ENABLE ROW LEVEL SECURITY;

-- Agency members read their own requests.
CREATE POLICY "Agency members read own booking requests"
  ON public.tailor_made_booking_requests FOR SELECT
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_users WHERE user_id = auth.uid())
  );

-- Agency members update status / notes on their own requests.
CREATE POLICY "Agency members update own booking requests"
  ON public.tailor_made_booking_requests FOR UPDATE
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_users WHERE user_id = auth.uid())
  );

-- Inserts come exclusively through the server action which uses the service
-- role to bypass RLS. No public INSERT policy.
