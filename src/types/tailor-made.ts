/**
 * Configuration types for the tailor-made walkthrough page.
 * See docs/tailor-made-v2-plan.md for design context.
 */

export type TailorMadeOption = {
  /** Stable identifier; auto-generated when omitted at write time. */
  id: string;
  label: string;
  description?: string;
};

/** The TourInput fields a walkthrough question can collect. */
export type WalkthroughField =
  | 'arrivalDate'
  | 'duration'
  | 'participants'
  | 'region'
  | 'interests'
  | 'accommodation'
  | 'budget'
  | 'inclusions'
  | 'customPreferences';

export type WalkthroughQuestionType =
  | 'date'
  | 'number'
  | 'multi_select'
  | 'single_select'
  | 'text';

/** Reference into one of the configured option lists. */
export type WalkthroughOptionsSource =
  | 'regions'
  | 'interests'
  | 'inclusions'
  | 'accommodation_tiers';

export type WalkthroughQuestion = {
  id: string;
  prompt: string;
  field: WalkthroughField;
  type: WalkthroughQuestionType;
  options?: string[];
  optionsSource?: WalkthroughOptionsSource;
  required: boolean;
  helperText?: string;
  showIf?: {
    field: WalkthroughField;
    equals: string | string[];
  };
};

export type OutputEnrichment = {
  why_we_picked: boolean;
  what_to_bring: boolean;
  cultural_notes: boolean;
  restaurant_picks: boolean;
  alternative_options: boolean;
  local_phrases: boolean;
};

export type TailorMadeConfig = {
  agencyId: string;
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
  /** When false, the AI skips the accommodation question and the generator
   *  marks every day as "Self-arranged". When true, the agency expects to
   *  book hotels for the visitor. */
  handlesAccommodation: boolean;
  /** Free-text hotel inventory + pricing the generator sees as context.
   *  Only used when handlesAccommodation === true. */
  accommodationNotes: string;
  updatedAt: string;
};

/** Public-safe slice surfaced to the visitor-side server component. */
export type TailorMadePublic = {
  enabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
};

export const DEFAULT_OUTPUT_ENRICHMENT: OutputEnrichment = {
  why_we_picked: true,
  what_to_bring: false,
  cultural_notes: false,
  restaurant_picks: false,
  alternative_options: false,
  local_phrases: false,
};
