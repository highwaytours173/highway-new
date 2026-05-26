import { randomUUID } from 'node:crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';
import {
  DEFAULT_OUTPUT_ENRICHMENT,
  type OutputEnrichment,
  type TailorMadeConfig,
  type TailorMadeOption,
  type TailorMadePublic,
  type WalkthroughQuestion,
} from '@/types/tailor-made';

type TailorMadeRow = {
  agency_id: string;
  enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  regions: unknown;
  interests: unknown;
  inclusions: unknown;
  accommodation_tiers: unknown;
  walkthrough_questions: unknown;
  walkthrough_persona: string;
  output_enrichment: unknown;
  handles_accommodation: boolean | null;
  accommodation_notes: string | null;
  updated_at: string;
};

// ─── Defaults (mirror the previously-hardcoded form arrays) ─────────────────

const DEFAULT_REGIONS: ReadonlyArray<TailorMadeOption> = [
  { id: 'cairo-giza', label: 'Cairo & Giza' },
  { id: 'luxor-aswan', label: 'Luxor & Aswan' },
  { id: 'red-sea', label: 'Red Sea (Hurghada/Sharm)' },
  { id: 'alexandria', label: 'Alexandria & North Coast' },
  { id: 'western-desert', label: 'Western Desert Oases' },
  { id: 'sinai', label: 'Sinai Peninsula' },
  { id: 'grand-tour', label: 'All Major Regions (Grand Tour)' },
];

const DEFAULT_INTERESTS: ReadonlyArray<TailorMadeOption> = [
  { id: 'history', label: 'History & Culture' },
  { id: 'adventure', label: 'Adventure & Safari' },
  { id: 'relaxation', label: 'Relaxation & Beach' },
  { id: 'food', label: 'Food & Culinary' },
  { id: 'nature', label: 'Nature & Wildlife' },
  { id: 'religious', label: 'Religious Sites' },
  { id: 'shopping', label: 'Shopping & Markets' },
  { id: 'photography', label: 'Photography' },
];

const DEFAULT_INCLUSIONS: ReadonlyArray<TailorMadeOption> = [
  { id: 'breakfast', label: 'Breakfast included' },
  { id: 'lunch', label: 'Lunch included' },
  { id: 'dinner', label: 'Dinner included' },
  { id: 'tickets', label: 'Entrance tickets for all tours' },
  { id: 'camel', label: 'Camel ride experience' },
  { id: 'guide', label: 'Private tour guide' },
  { id: 'transfer', label: 'Airport transfers' },
  { id: 'transport', label: 'Local transportation' },
];

const DEFAULT_ACCOMMODATION_TIERS: ReadonlyArray<TailorMadeOption> = [
  { id: '3-star', label: '3-star hotel accommodation' },
  { id: '4-star', label: '4-star hotel accommodation' },
  { id: '5-star', label: '5-star hotel accommodation' },
  { id: 'self-booked', label: 'Self-booked accommodation' },
];

const DEFAULT_WALKTHROUGH: ReadonlyArray<WalkthroughQuestion> = [
  {
    id: 'q-dates',
    prompt: "When are you thinking of travelling? A rough arrival date is perfect.",
    field: 'arrivalDate',
    type: 'date',
    required: true,
  },
  {
    id: 'q-duration',
    prompt: "How many days would you like the trip to last?",
    field: 'duration',
    type: 'number',
    required: true,
  },
  {
    id: 'q-participants',
    prompt: "How many people in total, including yourself?",
    field: 'participants',
    type: 'number',
    required: true,
  },
  {
    id: 'q-region',
    prompt: "Where in Egypt would you love to spend time? You can pick more than one.",
    field: 'region',
    type: 'multi_select',
    optionsSource: 'regions',
    required: true,
  },
  {
    id: 'q-interests',
    prompt: "What kind of experiences do you love most when you travel?",
    field: 'interests',
    type: 'multi_select',
    optionsSource: 'interests',
    required: true,
  },
  {
    id: 'q-accommodation',
    prompt: "What level of comfort do you usually go for?",
    field: 'accommodation',
    type: 'single_select',
    optionsSource: 'accommodation_tiers',
    required: true,
  },
  {
    id: 'q-budget',
    prompt:
      "What's your rough budget per person for the whole trip? Feel free to give a range.",
    field: 'budget',
    type: 'text',
    required: true,
    helperText: 'Include the currency so we can match accordingly (e.g. 1500 USD).',
  },
  {
    id: 'q-inclusions',
    prompt: "Any of these you'd definitely like included?",
    field: 'inclusions',
    type: 'multi_select',
    optionsSource: 'inclusions',
    required: false,
  },
  {
    id: 'q-custom',
    prompt:
      "Anything else we should know? Allergies, anniversaries, must-see places, accessibility — anything.",
    field: 'customPreferences',
    type: 'text',
    required: false,
  },
];

// ─── Row parsing ─────────────────────────────────────────────────────────────

function ensureOptionList(value: unknown, fallback: ReadonlyArray<TailorMadeOption>): TailorMadeOption[] {
  if (!Array.isArray(value)) return fallback.map((o) => ({ ...o }));
  const parsed: TailorMadeOption[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const label = typeof record.label === 'string' ? record.label.trim() : '';
    if (!label) continue;
    parsed.push({
      id: typeof record.id === 'string' && record.id ? record.id : slugify(label),
      label,
      description:
        typeof record.description === 'string' && record.description.trim()
          ? record.description.trim()
          : undefined,
    });
  }
  return parsed.length > 0 ? parsed : fallback.map((o) => ({ ...o }));
}

function ensureWalkthrough(value: unknown): WalkthroughQuestion[] {
  if (!Array.isArray(value)) return DEFAULT_WALKTHROUGH.map((q) => ({ ...q }));
  const parsed: WalkthroughQuestion[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const prompt = typeof record.prompt === 'string' ? record.prompt.trim() : '';
    const field = typeof record.field === 'string' ? record.field : '';
    const type = typeof record.type === 'string' ? record.type : '';
    if (!prompt || !field || !type) continue;
    parsed.push({
      id: typeof record.id === 'string' && record.id ? record.id : randomUUID(),
      prompt,
      field: field as WalkthroughQuestion['field'],
      type: type as WalkthroughQuestion['type'],
      options: Array.isArray(record.options) ? (record.options as string[]) : undefined,
      optionsSource: typeof record.optionsSource === 'string'
        ? (record.optionsSource as WalkthroughQuestion['optionsSource'])
        : undefined,
      required: Boolean(record.required),
      helperText:
        typeof record.helperText === 'string' && record.helperText.trim()
          ? record.helperText.trim()
          : undefined,
      showIf: record.showIf && typeof record.showIf === 'object'
        ? (record.showIf as WalkthroughQuestion['showIf'])
        : undefined,
    });
  }
  return parsed.length > 0 ? parsed : DEFAULT_WALKTHROUGH.map((q) => ({ ...q }));
}

function ensureEnrichment(value: unknown): OutputEnrichment {
  if (!value || typeof value !== 'object') return { ...DEFAULT_OUTPUT_ENRICHMENT };
  const record = value as Record<string, unknown>;
  return {
    why_we_picked: Boolean(record.why_we_picked ?? DEFAULT_OUTPUT_ENRICHMENT.why_we_picked),
    what_to_bring: Boolean(record.what_to_bring ?? DEFAULT_OUTPUT_ENRICHMENT.what_to_bring),
    cultural_notes: Boolean(record.cultural_notes ?? DEFAULT_OUTPUT_ENRICHMENT.cultural_notes),
    restaurant_picks: Boolean(record.restaurant_picks ?? DEFAULT_OUTPUT_ENRICHMENT.restaurant_picks),
    alternative_options: Boolean(
      record.alternative_options ?? DEFAULT_OUTPUT_ENRICHMENT.alternative_options
    ),
    local_phrases: Boolean(record.local_phrases ?? DEFAULT_OUTPUT_ENRICHMENT.local_phrases),
  };
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || randomUUID()
  );
}

function rowToConfig(row: TailorMadeRow): TailorMadeConfig {
  return {
    agencyId: row.agency_id,
    enabled: row.enabled,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    regions: ensureOptionList(row.regions, DEFAULT_REGIONS),
    interests: ensureOptionList(row.interests, DEFAULT_INTERESTS),
    inclusions: ensureOptionList(row.inclusions, DEFAULT_INCLUSIONS),
    accommodationTiers: ensureOptionList(row.accommodation_tiers, DEFAULT_ACCOMMODATION_TIERS),
    walkthroughQuestions: ensureWalkthrough(row.walkthrough_questions),
    walkthroughPersona: row.walkthrough_persona ?? '',
    outputEnrichment: ensureEnrichment(row.output_enrichment),
    handlesAccommodation: Boolean(row.handles_accommodation),
    accommodationNotes: row.accommodation_notes ?? '',
    updatedAt: row.updated_at,
  };
}

function defaultConfig(agencyId: string): TailorMadeConfig {
  return {
    agencyId,
    enabled: true,
    heroTitle: 'Tailor Made Your Tour',
    heroSubtitle:
      "Tell our AI travel expert what kind of trip you're after — we'll handle the rest.",
    regions: DEFAULT_REGIONS.map((o) => ({ ...o })),
    interests: DEFAULT_INTERESTS.map((o) => ({ ...o })),
    inclusions: DEFAULT_INCLUSIONS.map((o) => ({ ...o })),
    accommodationTiers: DEFAULT_ACCOMMODATION_TIERS.map((o) => ({ ...o })),
    walkthroughQuestions: DEFAULT_WALKTHROUGH.map((q) => ({ ...q })),
    walkthroughPersona: '',
    outputEnrichment: { ...DEFAULT_OUTPUT_ENRICHMENT },
    handlesAccommodation: false,
    accommodationNotes: '',
    updatedAt: new Date(0).toISOString(),
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Load the agency's tailor-made config. If no row exists, the in-memory
 * defaults are returned (no DB write). The admin's first save will create
 * the row; this read path stays cheap.
 */
export async function getTailorMadeConfig(agencyId: string): Promise<TailorMadeConfig> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('agency_tailor_made_config')
    .select('*')
    .eq('agency_id', agencyId)
    .maybeSingle();
  if (error) {
    console.error('Failed to load tailor-made config:', error);
    return defaultConfig(agencyId);
  }
  if (!data) return defaultConfig(agencyId);
  return rowToConfig(data as TailorMadeRow);
}

export type TailorMadeConfigUpdate = Partial<{
  enabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
  regions: TailorMadeOption[];
  interests: TailorMadeOption[];
  inclusions: TailorMadeOption[];
  accommodationTiers: TailorMadeOption[];
  walkthroughQuestions: WalkthroughQuestion[];
  walkthroughPersona: string;
  outputEnrichment: OutputEnrichment;
  handlesAccommodation: boolean;
  accommodationNotes: string;
}>;

export async function upsertTailorMadeConfig(
  agencyId: string,
  patch: TailorMadeConfigUpdate
): Promise<TailorMadeConfig> {
  const supabase = createServiceRoleClient();
  const payload: Record<string, unknown> = {
    agency_id: agencyId,
    updated_at: new Date().toISOString(),
  };
  if (patch.enabled !== undefined) payload.enabled = patch.enabled;
  if (patch.heroTitle !== undefined) payload.hero_title = patch.heroTitle.slice(0, 120);
  if (patch.heroSubtitle !== undefined) payload.hero_subtitle = patch.heroSubtitle.slice(0, 400);
  if (patch.regions !== undefined) payload.regions = patch.regions;
  if (patch.interests !== undefined) payload.interests = patch.interests;
  if (patch.inclusions !== undefined) payload.inclusions = patch.inclusions;
  if (patch.accommodationTiers !== undefined) payload.accommodation_tiers = patch.accommodationTiers;
  if (patch.walkthroughQuestions !== undefined)
    payload.walkthrough_questions = patch.walkthroughQuestions;
  if (patch.walkthroughPersona !== undefined)
    payload.walkthrough_persona = patch.walkthroughPersona.slice(0, 4000);
  if (patch.outputEnrichment !== undefined) payload.output_enrichment = patch.outputEnrichment;
  if (patch.handlesAccommodation !== undefined)
    payload.handles_accommodation = patch.handlesAccommodation;
  if (patch.accommodationNotes !== undefined)
    payload.accommodation_notes = patch.accommodationNotes.slice(0, 8000);

  const { data, error } = await supabase
    .from('agency_tailor_made_config')
    .upsert(payload, { onConflict: 'agency_id' })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to save tailor-made config: ${error.message}`);
  }
  return rowToConfig(data as TailorMadeRow);
}

/**
 * Public-safe slice for the visitor server component. Returns sensible
 * defaults (`enabled: true`) when the agency hasn't customised anything
 * yet — keeps the page available out of the box.
 */
export async function getTailorMadePublic(agencyId: string): Promise<TailorMadePublic> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('agency_tailor_made_public')
    .select('enabled, hero_title, hero_subtitle')
    .eq('agency_id', agencyId)
    .maybeSingle();
  if (error || !data) {
    return {
      enabled: true,
      heroTitle: 'Tailor Made Your Tour',
      heroSubtitle:
        "Tell our AI travel expert what kind of trip you're after — we'll handle the rest.",
    };
  }
  const row = data as {
    enabled: boolean;
    hero_title: string;
    hero_subtitle: string;
  };
  return {
    enabled: row.enabled,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
  };
}
