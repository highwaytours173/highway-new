# Tailor-Made Studio — Plan

Status: **Draft — pending review**
Author: planning session
Scope: turn `/tailor-made` from a static, hardcoded 3-step form into a configurable agency-owned experience with two visitor entry modes (Quick Form + Conversational Walkthrough), richer AI output, and an admin "Studio" page to control every dial.

---

## 1. Vision

Today the tailor-made page is the same for every agency: same regions, same interests, same inclusions, same shape of output. Two problems:

- **Visitors** find the 3-step form intimidating. They have to know upfront whether they want "Cairo & Giza" vs "Western Desert Oases", what counts as "5-star accommodation", and how to articulate their budget. People who DON'T know what they want bounce.
- **Agencies** can't shape the experience. A boutique Nile-cruise specialist gets the same dropdown as a Sinai dive operator. The hardcoded option lists are wrong for half the agencies on the platform.

**The plan reframes the page in three layers:**

1. **Studio (admin)** — a new `/admin/ai/tailor-made` page where the agency configures every option, every question, every output emphasis. Toggle the whole page on/off. Choose the visitor entry mode.

2. **Two entry modes for visitors:**
   - **Quick Form** — the existing 3-step form, but options now come from the agency's config. Fewer fields by default, opt-in advanced fields.
   - **Conversational Walkthrough** — an AI-guided chat that asks the visitor one thing at a time, follows up on interesting answers, and ends with the same itinerary. For people who'd rather talk than fill forms.
   - Agencies can pick *form only*, *walkthrough only*, or *let visitor choose* on a landing card.

3. **Enriched output** — the generated itinerary gets richer fields: per-day why-we-picked-this rationales, what-to-bring tips, alternative options, restaurant suggestions, cultural notes. Each enrichment is a togglable admin choice so agencies opt in to the detail they want.

The existing post-generation chat panel (`<TailorMadeChatPanel>`) stays unchanged — it works on top of whichever entry mode was used.

---

## 2. Decisions to confirm

| # | Question | Proposed | Alt |
|---|---|---|---|
| D1 | Walkthrough UX style | **Chat-style** (bubbles, single input at a time) using the existing chat primitives. Familiar to anyone who's used the concierge widget. | Step-by-step card UI — more structured but feels like a form again. |
| D2 | Walkthrough state | **In-memory + sessionStorage** (the existing `useChatSession` hook). Survives page reloads in the same tab, evaporates on close. | Persist to DB — overkill for an anonymous-visitor flow. |
| D3 | Walkthrough backend | **New `/api/tailor-made/walkthrough` SSE route** modeled after the concierge route, with its own surface and a `walkthroughQuestions` anchor that pre-loads the agency's configured spine. | Reuse `/api/chat/concierge` — works but conflates two different conversation types in the audit log. |
| D4 | Custom fields | **Pre-set list of fields** (the existing ones: regions, interests, inclusions, accommodation, budget, duration, participants, customPreferences). Admins add/remove options inside each field. NO fully custom field names in v1. | Fully custom fields (e.g. "Wine tasting tour?") — opens a schema-validation can of worms; defer. |
| D5 | Output enrichment | **Optional fields, agency-controlled** — six toggles (`why_we_picked`, `what_to_bring`, `cultural_notes`, `restaurant_picks`, `alternative_options`, `local_phrases`). When ON, the output schema gets the corresponding nested fields. | Always-on — every itinerary gets bloated, even when the agency just wants a clean day list. |
| D6 | Backward compat for agencies with no config | **Auto-seed defaults on first visit** to the `/admin/ai/tailor-made` page (same pattern as the AI Concierge bootstrap). The current hardcoded regions/interests/inclusions become the default seed. Until the admin opens the page, the visitor sees the new system with the seeded defaults — no broken experience. | Read the hardcoded constants as fallback at the public route — works but ties the new system to legacy code. |
| D7 | Admin AI helper scope | **Two helpers**: (a) "Draft a walkthrough" — admin gives a brief, Copilot returns a sequenced question list; (b) "Suggest regions from my tours" — scans the agency's tour catalog and proposes regions the agency actually sells. | Single AI generator that authors the entire config from one brief — fragile; admins prefer to compose. |
| D8 | Tailor-made page disabled state | **Server-side redirect to `/tours`**, same as the existing `aiEnabled === false` guard. The nav-bar link is hidden via the existing `aiConfigPublic` channel — we add a new `showTailorMade` flag. | 404 — confusing if the visitor follows an old link. |
| D9 | Walkthrough "I'm ready, generate" escape hatch | **Show a "Generate my plan now" button whenever ≥ 5 required fields are filled.** Visitor doesn't have to answer every question to get a result. | Make all questions mandatory — kills the conversational feel. |
| D10 | Enriched output rendering | **Tabbed view per day** (Overview / Tips / Alternates / Local) inside each itinerary day card. Defaults to Overview to keep the page clean. | One long stacked layout — visually overwhelming for trips with rich enrichment. |

Build assumes the **proposed** column.

---

## 3. Architecture overview

```
┌──────────────────────── /tailor-made (public) ───────────────────────┐
│                                                                       │
│   Server fetches `agency_tailor_made_config`.                        │
│                                                                       │
│   if enabled === false:    redirect('/tours')                        │
│   if entry_mode === 'form':         render <QuickForm />             │
│   if entry_mode === 'walkthrough':  render <WalkthroughChat />       │
│   if entry_mode === 'choice':       render <EntryChoiceLanding />    │
│                                                                       │
│   ┌─────────────────────────┐    ┌─────────────────────────────┐   │
│   │  <QuickForm>            │    │  <WalkthroughChat>          │   │
│   │  - reads regions/       │    │  - reads questions[] spine  │   │
│   │    interests/inclusions │    │  - uses useChatSession      │   │
│   │    from config          │    │  - POSTs each turn to       │   │
│   │  - submits via existing │    │    /api/tailor-made/        │   │
│   │    generateTailorMade-  │    │    walkthrough              │   │
│   │    TourAction           │    │  - emits final TourOutput   │   │
│   └──────────┬──────────────┘    │    once spine is satisfied  │   │
│              │                    └──────────┬──────────────────┘   │
│              ▼                               ▼                       │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  <ResultView>  (existing)                                 │      │
│   │  - tour name, summary, totalPrice                         │      │
│   │  - day-by-day itinerary                                   │      │
│   │  - NEW: per-day tabs (Overview / Tips / Alts / Local)    │      │
│   │    rendered only when the agency enabled enrichment       │      │
│   │  - existing <TailorMadeChatPanel> below for revisions    │      │
│   └──────────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────┘

┌──────────────────── /admin/ai/tailor-made (admin) ──────────────────┐
│                                                                       │
│   Sections (server-loaded config, save via server actions):          │
│   1. Master switch + entry-mode picker                                │
│   2. Page copy (hero title + subtitle)                                │
│   3. Form options — Regions / Interests / Inclusions / Accommodations│
│      (add / edit / remove / reorder, drag handle)                     │
│   4. Walkthrough script editor (question list)                        │
│      - "Draft walkthrough with AI" button                             │
│   5. Output enrichment toggles (6 of them)                            │
│   6. "Suggest regions from my tours" AI helper                        │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database schema

`supabase/migrations/YYYYMMDDHHMMSS_add_tailor_made_config.sql`

```sql
CREATE TABLE IF NOT EXISTS public.agency_tailor_made_config (
  agency_id UUID PRIMARY KEY REFERENCES public.agencies(id) ON DELETE CASCADE,

  -- Master switch and entry-mode picker.
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  entry_mode TEXT NOT NULL DEFAULT 'choice'
    CHECK (entry_mode IN ('form_only', 'walkthrough_only', 'choice')),

  -- Page copy (i18n later if needed).
  hero_title TEXT NOT NULL DEFAULT 'Tailor Made Your Tour',
  hero_subtitle TEXT NOT NULL DEFAULT
    'Design your perfect adventure. Tell us your preferences and our AI travel expert will craft a personalized itinerary just for you in seconds.',

  -- Form-mode option lists. JSON arrays of { id, label, description?, icon? }.
  regions JSONB NOT NULL DEFAULT '[]'::JSONB,
  interests JSONB NOT NULL DEFAULT '[]'::JSONB,
  inclusions JSONB NOT NULL DEFAULT '[]'::JSONB,
  accommodation_tiers JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Walkthrough spine — ordered list of questions the AI must collect.
  -- See §6.2 for the question schema.
  walkthrough_questions JSONB NOT NULL DEFAULT '[]'::JSONB,
  walkthrough_persona TEXT NOT NULL DEFAULT '',  -- optional per-walkthrough tone tweak

  -- Output enrichment toggles. Schema: { why_we_picked: bool, what_to_bring: bool,
  --   cultural_notes: bool, restaurant_picks: bool, alternative_options: bool,
  --   local_phrases: bool }
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
  'Per-agency configuration for the tailor-made tour page (entry mode, form options, walkthrough script, output enrichment).';

ALTER TABLE public.agency_tailor_made_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members read own tailor-made config"
  ON public.agency_tailor_made_config FOR SELECT
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Agency members write own tailor-made config"
  ON public.agency_tailor_made_config FOR ALL
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_users WHERE user_id = auth.uid())
  );

-- Public-readable view exposing only what the visitor-side server component
-- needs (enabled + entry_mode + hero copy). The rest stays private.
CREATE OR REPLACE VIEW public.agency_tailor_made_public AS
  SELECT agency_id, enabled, entry_mode, hero_title, hero_subtitle
  FROM public.agency_tailor_made_config;

GRANT SELECT ON public.agency_tailor_made_public TO anon, authenticated;
```

No backfill in the migration. Auto-seed happens on first admin visit (see D6).

**Aggregate `Agency` type extension:**

```ts
export type AgencyAiConfigPublic = {
  ...                       // existing
  showTailorMade: boolean;  // derived from tailor_made_config.enabled
  tailorMadeEntryMode: 'form_only' | 'walkthrough_only' | 'choice';
};
```

---

## 5. Public UX — Quick Form mode (simplified)

The current 3-step form stays as a *mode*, not the only path. We trim it to feel less intimidating:

- **Step 1 — Travel dates & party size** (unchanged: arrivalDate, duration, participants)
- **Step 2 — Where & what excites you** (regions + interests — both fed from config)
- **Step 3 — Comfort & budget** (accommodation tier + budget + inclusions — also fed from config; `customPreferences` textarea is now an opt-in "Add a note" expander, not always-visible)

UX tweaks:
- Each step gets a one-sentence motivational subtitle ("Step 1 of 3 — we'll pick this fast 👀").
- "Live trip summary" sidebar on the right (already exists) stays, with a friendlier empty-state.
- "Next" buttons show what's coming: "Next: where & what excites you →".

The current code is in `tailor-made-form.tsx`. Changes:
- Replace hardcoded `const regions = [...]` with `props.config.regions`.
- Same for interests/inclusions/accommodation_tiers.
- Pass `config` from the server page.

No DB schema change for visitor input — we keep `TourInputSchema` exactly as-is.

---

## 6. Public UX — Conversational Walkthrough mode (new)

### 6.1 Visitor experience

```
┌─────────────────────────────────────────────────────┐
│  Tailor Made Your Tour                              │
│  Step 1 of 7 ─ Let's start with when                │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🌟 Hi, I'm Cleo. I'll help you plan a trip   │  │
│  │ to Egypt that fits you. When do you want     │  │
│  │ to travel?                                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│                ┌──────────────────────────────────┐  │
│                │  Picking dates for me · December │  │
│                │  10 to December 17, 2026         │  │
│                └──────────────────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │ 7 days — great timing for cooler weather.    │  │
│  │ Quick follow-up: rough budget per person?    │  │
│  │                                                │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│  │
│  │  │$500-1k │ │$1-2k   │ │$2-4k   │ │$4k+    ││  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘│  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  ───────────────────────────────────────────────────  │
│  Tell me ────────────────────────────────[ Send ▸ ]  │
│  ───────────────────────────────────────────────────  │
│                                                       │
│  [ Generate my plan now ]      ▰▰▰▰▱▱▱  4/7         │
└─────────────────────────────────────────────────────┘
```

Key behaviors:

- **Progress indicator** at the bottom shows how many configured questions are answered.
- **Inline option chips** when the current question has a `single_select` or `multi_select` type — the visitor doesn't have to type.
- **Smart follow-ups** — between configured questions, the AI may ask one clarifying follow-up if the answer is ambiguous. Hard cap: max 1 follow-up per spine question, never derails.
- **"Generate my plan now"** button — appears once the minimum required fields are collected (default: ≥ 5 of the spine questions). Lets the visitor escape the conversation when they're ready.
- **End state** — once the spine is satisfied OR the visitor hits Generate, the chat collapses and the same `<ResultView>` renders with the tour.

### 6.2 Walkthrough question schema

Stored in `agency_tailor_made_config.walkthrough_questions` as a JSON array:

```ts
type WalkthroughQuestion = {
  id: string;            // stable UUID/slug
  prompt: string;        // what the AI says — supports {agencyName} interpolation
  field: WalkthroughField;
  type: 'date' | 'number' | 'multi_select' | 'single_select' | 'text';
  options?: string[];    // for *_select; ignored for date/number/text
  optionsSource?: 'regions' | 'interests' | 'inclusions' | 'accommodation_tiers';
                         // when set, options come from the matching config list
                         // (keeps options in sync if the admin edits them)
  required: boolean;
  showIf?: {             // conditional display
    field: WalkthroughField;
    equals: string | string[];
  };
  helperText?: string;   // optional UI helper shown under the input
};

type WalkthroughField =
  | 'arrivalDate'
  | 'duration'
  | 'participants'
  | 'region'
  | 'interests'
  | 'accommodation'
  | 'budget'
  | 'inclusions'
  | 'customPreferences';
```

The admin can reorder, add, remove, and tweak prompts per question — but the `field` is locked to the existing TourInputSchema fields so we don't need a schema migration. (See D4.)

### 6.3 Server side

New route: `POST /api/tailor-made/walkthrough` (SSE).

Request body:
```ts
{
  sessionId?: string;
  messages: ChatMessage[];   // running transcript
  collected: Partial<TourInput>;  // what's been gathered so far
  questions: WalkthroughQuestion[];  // the spine (sent each turn to avoid drift)
  trigger?: 'generate_now' | null;  // user hit the escape button
}
```

System prompt (skeleton):

```
You are {agentName}, {agencyName}'s tailor-made trip planner. Your job is
to guide a visitor through a short conversation that ends with a JSON
brief we can pass to the tour generator.

The visitor is talking to YOU as {agencyName}. Speak warmly, conversationally,
in ≤ 2 sentences per turn.

SPINE — the questions you MUST collect, in order:
{questions stringified}

ALREADY COLLECTED:
{collected stringified}

Rules:
- Ask ONE spine question at a time. Never ask two at once.
- If the visitor's answer is ambiguous, ask AT MOST one clarifying follow-up
  before moving on. Don't grill them.
- If the question has options, you can suggest them inline ("we're known
  for Cairo & Giza, Luxor & Aswan, or the Red Sea — any of those interest
  you?"). The UI also shows chips.
- When all required spine questions are answered OR the visitor signals
  they're done ("just generate it", "I'm ready"), output the special
  signal: <READY>{ tourInput: <TourInput JSON> }</READY> and STOP.
- Never invent tours, prices, or dates. The tour generator will handle that.

After <READY>, the gateway will call generateTailorMadeTourAction with the
extracted tourInput.
```

The `<READY>{...}</READY>` sentinel is parsed server-side, the `tourInput` validated against `TourInputSchema`, and the generator kicks off. The visitor sees a smooth transition: chat fades → "Building your plan…" spinner → result view.

The route does NOT use the chat-tools layer (no `getPrice`/`searchTours` calls during walkthrough) — it's purely a structured-conversation collector. Tool layer comes back for the post-result chat panel.

---

## 7. Output enrichment

Extend `TourOutputSchema` (in `src/types/tour-schemas.ts`) with optional fields the LLM populates only when the corresponding config toggle is on.

```ts
export const ItineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
  activities: z.array(z.string()),
  accommodation: z.string(),
  meals: z.array(z.string()),

  // ─── Enrichment (optional, opt-in per agency) ──────────────────
  whyWePickedThis: z.string().optional(),     // why_we_picked toggle
  whatToBring: z.array(z.string()).optional(),// what_to_bring toggle
  culturalNotes: z.string().optional(),       // cultural_notes toggle
  restaurantPicks: z.array(z.object({
    name: z.string(),
    note: z.string(),
  })).optional(),                              // restaurant_picks toggle
  alternativeOptions: z.array(z.object({
    label: z.string(),
    description: z.string(),
  })).optional(),                              // alternative_options toggle
  localPhrases: z.array(z.object({
    phrase: z.string(),
    translation: z.string(),
  })).optional(),                              // local_phrases toggle
});
```

Server-side: when calling `generateTourFlow`, the system prompt includes a list of which optional fields to populate (based on `output_enrichment`). Fields not requested aren't mentioned at all → the LLM doesn't add them → token cost stays predictable.

Client-side rendering (per D10): each day card grows a small tab strip when enrichment fields exist:

```
┌─ Day 3: Luxor temples ─────────────────────────────┐
│ Description: …                                      │
│ Activities · Stay · Meals                           │
│                                                      │
│ [ Overview ] [ Tips ] [ Alternates ] [ Local ]     │
│ ──────────────────────────────────────────────      │
│ (selected tab content)                              │
└─────────────────────────────────────────────────────┘
```

Tabs only render when their corresponding field has content. A day with no enrichments stays as the existing simple card.

---

## 8. Admin UX — Tailor-Made Studio

New page at `/admin/ai/tailor-made`. Added to the AI sidebar group below "AI Audit".

### 8.1 Page layout

```
┌──── Tailor-Made Studio ─────────────────────────────────────┐
│  Configure how visitors plan custom trips through your site.│
│                                                              │
│  ┌─ Visibility ────────────────────────────────────────────┐│
│  │ ⚪ Off  ●  On   Show the tailor-made page                ││
│  │                                                           ││
│  │ Entry mode for visitors                                   ││
│  │ ○ Quick form only                                         ││
│  │ ● Let them choose (form or guided walkthrough)            ││
│  │ ○ Conversational walkthrough only                         ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ Page copy ─────────────────────────────────────────────┐│
│  │ Hero title       [ Tailor Made Your Tour              ] ││
│  │ Hero subtitle    [ Design your perfect…              ] ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ Form options ──────────────────────────────────────────┐│
│  │                                                           ││
│  │  Regions  (8)                              [+ Add] ✨    ││
│  │  ──────────────────────────────────────────────────────  ││
│  │  ⋮ Cairo & Giza                                  [×]   ││
│  │  ⋮ Luxor & Aswan                                 [×]   ││
│  │  ⋮ Red Sea (Hurghada / Sharm)                    [×]   ││
│  │  ⋮ Western Desert Oases                          [×]   ││
│  │  …                                                        ││
│  │                                                           ││
│  │  Interests  (8)                            [+ Add]      ││
│  │  Inclusions  (8)                           [+ Add]      ││
│  │  Accommodation tiers  (4)                  [+ Add]      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ Walkthrough script ────────────────────────────────────┐│
│  │  7 questions configured                                   ││
│  │                          [ Draft with AI ✨ ] [+ Add]    ││
│  │  ──────────────────────────────────────────────────────  ││
│  │  ⋮ 1. When do you want to travel?           [Edit] [×] ││
│  │       field: arrivalDate · type: date · required          ││
│  │  ⋮ 2. How many days?                        [Edit] [×] ││
│  │       field: duration · type: number · required           ││
│  │  ⋮ 3. Where in Egypt excites you most?      [Edit] [×] ││
│  │       field: region · multi_select · synced with Regions  ││
│  │  …                                                        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ Output enrichment ─────────────────────────────────────┐│
│  │ ☑ Why we picked this — per-day rationales                ││
│  │ ☐ What to bring — packing tips per day                   ││
│  │ ☐ Cultural notes — dress / etiquette per stop            ││
│  │ ☐ Restaurant picks — local favorites per day             ││
│  │ ☐ Alternative options — "if you'd rather, swap day 3 …" ││
│  │ ☐ Local phrases — 2-3 useful phrases per region          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [ Revert ]                                  [ Save changes ]│
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Option-list editor

For each of Regions / Interests / Inclusions / Accommodation tiers — a reusable `<OptionListEditor>` component:

- Drag handle to reorder (uses an existing dnd lib if present, else simple up/down arrows)
- Inline edit of label + optional description (modal on click)
- Delete with confirm
- "+ Add" opens a small inline editor at the bottom
- "✨ Suggest from my tours" button calls a server action that scans the agency's `tours.destinations` / `tours.type` and proposes additions

### 8.3 Walkthrough script editor

Reorderable list of `WalkthroughQuestion` cards. Each card edit modal lets the admin:
- Pick the underlying `field` from a fixed dropdown (the 9 TourInput fields)
- Choose `type` (auto-narrows based on field — e.g. `arrivalDate` forces type=date)
- Write the `prompt` (with `{agencyName}` placeholder available)
- Toggle `required`
- Set `optionsSource` to sync with one of the form-mode option lists, OR free-type custom options
- Optional `showIf` condition (e.g. "only ask about accommodation tier if budget > $X")

### 8.4 Admin AI helpers

Two buttons, each calling a Copilot-backed server action:

**"Draft walkthrough with AI"** — opens a dialog asking for a brief ("describe your typical traveler"). Returns a structured array of 5-9 `WalkthroughQuestion` rows. Admin reviews + applies, overwriting the current spine on confirm.

**"Suggest regions from my tours"** — under the Regions list. Reads `tours.destinations[]` for the agency, deduplicates, and proposes any not yet in the regions list. Admin clicks "Add all" or picks individuals.

Same pattern works for "Suggest interests from my tours" (reads `tours.type[]`).

Both reuse `generateStructuredWithCopilot` from the existing AI plumbing.

---

## 9. API routes + server actions

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/tailor-made/walkthrough` | POST (SSE) | none (rate-limited) | Conversational walkthrough turn — emits chat events + final `tourInput` |
| Server action `getTailorMadeConfig()` | — | admin | Load agency's config (creates auto-seed row on first call) |
| Server action `updateTailorMadeConfig(patch)` | — | admin | Save partial updates |
| Server action `draftWalkthroughWithAi(brief)` | — | admin | Returns a generated `WalkthroughQuestion[]` |
| Server action `suggestOptionsFromTours(list)` | — | admin | Reads tour catalog → proposes regions/interests |
| `/api/tailor-made/generate` | POST | none (rate-limited) | Replaces existing `generateTailorMadeTourAction` — accepts `TourInput` + agency enrichment flags, calls the generator |

Rate limits inherit from the existing `chat-rate-limit.ts` (extended to cover these new routes; same per-session / per-IP / per-agency limits).

---

## 10. File inventory

```
NEW
  supabase/migrations/YYYYMMDDHHMMSS_add_tailor_made_config.sql

  src/types/tailor-made.ts                    # WalkthroughQuestion etc
  (modified) src/types/tour-schemas.ts        # enrichment fields

  src/lib/supabase/tailor-made-config.ts      # CRUD + bootstrap

  src/app/admin/ai/tailor-made/page.tsx
  src/app/admin/ai/tailor-made/studio-client.tsx
  src/app/admin/ai/tailor-made/actions.ts     # server actions
  src/components/admin/tailor-made/
    visibility-section.tsx
    page-copy-section.tsx
    option-list-editor.tsx
    walkthrough-script-editor.tsx
    walkthrough-question-dialog.tsx
    output-enrichment-section.tsx
    suggest-options-dialog.tsx
    draft-walkthrough-dialog.tsx

  src/app/api/tailor-made/walkthrough/route.ts
  src/app/api/tailor-made/generate/route.ts   # replaces the action
  src/lib/ai/walkthrough.ts                   # walkthrough gateway
  src/lib/ai/walkthrough-prompt.ts            # system-prompt builder

  src/components/tailor-made/entry-choice-landing.tsx
  src/components/tailor-made/walkthrough-chat.tsx
  src/components/tailor-made/walkthrough-input.tsx       # text + chips
  src/components/tailor-made/itinerary-day-card.tsx      # extracted from form
  src/components/tailor-made/itinerary-day-tabs.tsx      # enrichment tabs

MODIFIED
  src/app/(main)/tailor-made/page.tsx               # config-aware routing
  src/app/(main)/tailor-made/tailor-made-content.tsx
  src/app/(main)/tailor-made/tailor-made-form.tsx   # reads config-driven options
  src/lib/supabase/agencies.ts                      # surface showTailorMade flag
  src/types/agency.ts                                # aiConfigPublic adds field
  src/components/admin/admin-sidebar.tsx            # new "Tailor-Made Studio" link
  src/ai/flows/generateTour.ts                       # enrichment-aware prompt
  src/types/tour-schemas.ts                          # optional enrichment fields
```

---

## 11. Sprints

Each sprint ends with `npm run typecheck && npm run lint` clean.

### Sprint 1 — Foundation (~1 day)
1. Migration: `agency_tailor_made_config` + RLS + public view.
2. Types (`tailor-made.ts`, extend Agency).
3. `tailor-made-config.ts` supabase module with auto-seed on first read.
4. New admin page skeleton at `/admin/ai/tailor-made` with master toggle + entry-mode picker + page copy, save via server action.
5. Sidebar entry added.
6. Public page reads `enabled` flag → redirects when off.

### Sprint 2 — Configurable form options (~1 day)
7. `<OptionListEditor>` reusable component with drag-reorder + inline edit + delete + add.
8. Wire into Studio for Regions / Interests / Inclusions / Accommodation tiers.
9. Public `tailor-made-form.tsx` reads option lists from config (replaces hardcoded arrays).
10. "Suggest from my tours" AI helper for Regions + Interests.
11. Auto-seed populates the option lists from the current hardcoded defaults on first visit.

### Sprint 3 — Walkthrough mode (~1.5 days)
12. Walkthrough question schema + `<WalkthroughScriptEditor>` UI.
13. `walkthrough-prompt.ts` + `/api/tailor-made/walkthrough` SSE route.
14. `<WalkthroughChat>` client component (chat bubbles + inline option chips + progress + generate-now button).
15. `<EntryChoiceLanding>` for the choice mode.
16. Public page routes to the right mode based on config.
17. "Draft walkthrough with AI" admin helper.

### Sprint 4 — Output enrichment (~1 day)
18. Extend `TourOutputSchema` with optional fields.
19. Update `generateTourFlow` prompt to conditionally request enrichments based on `output_enrichment` toggles.
20. `<ItineraryDayTabs>` component with Overview / Tips / Alternates / Local tabs (render only what's populated).
21. Wire into the existing result view.
22. Admin enrichment toggles in the Studio.

### Sprint 5 — Polish (~half day)
23. Animations / transitions on the walkthrough → generation handoff.
24. "Live trip summary" sidebar updated to show walkthrough progress.
25. Mobile responsiveness pass.
26. Test the "Generate my plan now" escape hatch.
27. Docs: README snippet for the Studio page.

**Total: ~5 days of focused work.**

---

## 12. Risk notes

1. **Spine drift in the walkthrough.** The LLM might wander off-script (asking favorite color, etc.). Mitigation: system prompt is strict, max 1 follow-up rule, audit log captures any spine deviations so admins can spot them.

2. **`<READY>` sentinel parsing.** If the LLM emits malformed JSON inside the sentinel, the walkthrough hangs. Mitigation: server-side try/parse with retry — if first attempt fails, prompt the LLM once more with "your previous output was invalid, emit valid JSON only." Hard cap of 2 retries before falling back to the form.

3. **Cost of enrichment.** Six enrichment fields × per-day = a much bigger LLM response. Mitigation: each toggle is opt-in; we estimate token impact in the admin UI ("enabling all toggles increases response size by ~3×").

4. **Auto-seed surprises.** First admin visit auto-seeds the regions/interests with our existing defaults. Agency might not want our defaults. Mitigation: clear banner on first visit: "We've pre-filled with sensible defaults — edit or clear them to match your offerings."

5. **Option-list sync.** Walkthrough questions can reference option lists by `optionsSource`. If the admin deletes a region but the walkthrough still references it, the live options shrink — fine. But the visible "Suggest" chips might disappear mid-conversation. Mitigation: re-derive options on each walkthrough turn server-side; never cache.

6. **Backward compat with existing pages.** Some agencies might already have the old `/tailor-made` linked from custom content. Hiding the page (D8) breaks those links. Mitigation: redirect to `/tours` is graceful; doc the toggle clearly.

---

## 13. Open questions

- **Should the walkthrough's chat use the same `<ChatMessage>` primitives as the concierge?** Probably — saves UI work, keeps tone consistent.
- **Per-day photo prompts** in enrichment — fetch real images from tours the agency owns, or AI-suggest URLs that don't exist? Strongly prefer real-tour images; can be a follow-up sprint.
- **Multi-language walkthrough** — does the AI walkthrough respect the visitor's browser language? Likely yes via the existing language detector; verify in Sprint 5.
- **Walkthrough abandonment recovery** — if the visitor closes the tab mid-walkthrough, do we capture the email + send a reminder? Defer; abandoned-cart pattern.

---

## 14. Sign-off checklist

- [ ] All 5 sprints' work in.
- [ ] `npm run typecheck` + `npm run lint` clean.
- [ ] Migration applied to staging.
- [ ] Agency owner can: turn the page off → check it 404s/redirects; turn it on → check both entry modes work; tweak a region → check it appears in form + walkthrough; toggle "Why we picked this" → check it shows on the result.
- [ ] Visitor can complete walkthrough in ≤ 8 turns and get a valid itinerary.
- [ ] "Generate my plan now" escape hatch works at any point after 5 spine questions.

---

**End of plan.** Awaiting your sign-off on D1–D10 (especially D5 — the enrichment shape — and D7 — admin helper scope) and any scope cuts. Once approved I'd execute Sprint 1 first (foundation + visibility toggle) so you can see the skeleton before the bigger Sprint 3 (walkthrough) work.
