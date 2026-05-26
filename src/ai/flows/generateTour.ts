import { generateStructuredWithCopilot } from '@/lib/ai/copilot';
import { TourInputSchema, TourOutputSchema } from '@/types/tour-schemas';
import type { OutputEnrichment } from '@/types/tailor-made';
import { z } from 'zod';

export { TourInputSchema, TourOutputSchema };

export type GenerateTourInput = z.infer<typeof TourInputSchema>;
export type GenerateTourOutput = z.infer<typeof TourOutputSchema>;

export type GenerateTourOptions = {
  enrichment?: OutputEnrichment;
  agencyId?: string;
  /** When false, the generator marks every day's accommodation as
   *  "Self-arranged" and avoids hotel-specific language. */
  handlesAccommodation?: boolean;
  /** Free-text hotel inventory + pricing surfaced when handlesAccommodation
   *  is true. Empty/undefined when unused. */
  accommodationNotes?: string;
};

const ENRICHMENT_SCHEMA_LINES: Record<keyof OutputEnrichment, string> = {
  why_we_picked:
    '  "whyWePickedThis": string,           // 1-2 sentences on why this day fits the visitor\'s brief',
  what_to_bring:
    '  "whatToBring": string[],             // 2-4 packing tips for this day (e.g. "modest clothing for temples")',
  cultural_notes:
    '  "culturalNotes": string,             // 1-2 sentences on dress, etiquette, or customs relevant to the day',
  restaurant_picks:
    '  "restaurantPicks": [ { "name": string, "note": string } ],  // 1-3 local restaurants worth trying',
  alternative_options:
    '  "alternativeOptions": [ { "label": string, "description": string } ],  // 1-2 swaps the visitor could request',
  local_phrases:
    '  "localPhrases": [ { "phrase": string, "translation": string } ],       // 2-3 useful phrases for the location',
};

const ENRICHMENT_RULE_LINES: Record<keyof OutputEnrichment, string> = {
  why_we_picked: 'Always include `whyWePickedThis` — it justifies the day to the visitor.',
  what_to_bring:
    'Always include `whatToBring` (2-4 short, specific items per day — avoid generic "passport, water").',
  cultural_notes:
    'Always include `culturalNotes` when the day touches a religious site, local market, or rural area.',
  restaurant_picks:
    'Always include `restaurantPicks` with REAL, known establishments when possible. If unsure, pick a representative type ("a Nile-side seafood spot in Aswan") rather than inventing a brand name.',
  alternative_options:
    'Always include `alternativeOptions` with 1-2 plausible swaps (e.g. "switch the camel ride for a quad-bike sunset tour").',
  local_phrases:
    'Always include `localPhrases` with 2-3 phrases relevant to the day\'s region (Arabic + transliteration).',
};

function enrichmentSchemaBlock(enrichment?: OutputEnrichment): string {
  if (!enrichment) return '';
  const lines: string[] = [];
  for (const key of Object.keys(ENRICHMENT_SCHEMA_LINES) as Array<keyof OutputEnrichment>) {
    if (enrichment[key]) lines.push(ENRICHMENT_SCHEMA_LINES[key]);
  }
  if (lines.length === 0) return '';
  return '\n      // ─── Per-day enrichment (REQUIRED when listed below) ───\n' + lines.join('\n');
}

function enrichmentRulesBlock(enrichment?: OutputEnrichment): string {
  if (!enrichment) return '';
  const lines: string[] = [];
  for (const key of Object.keys(ENRICHMENT_RULE_LINES) as Array<keyof OutputEnrichment>) {
    if (enrichment[key]) lines.push(`- ${ENRICHMENT_RULE_LINES[key]}`);
  }
  if (lines.length === 0) return '';
  return '\nENRICHMENT RULES — populate the per-day enrichment fields listed in the schema. Skip fields not listed.\n' + lines.join('\n');
}

export async function generateTourFlow(
  input: GenerateTourInput,
  options: GenerateTourOptions = {}
): Promise<GenerateTourOutput> {
  const validatedInput = TourInputSchema.parse(input);
  const enrichmentSchema = enrichmentSchemaBlock(options.enrichment);
  const enrichmentRules = enrichmentRulesBlock(options.enrichment);
  const handlesAccommodation = options.handlesAccommodation !== false;

  const accommodationSchemaComment = handlesAccommodation
    ? '// where they sleep that night, or "Overnight flight"/"Departure" when applicable'
    : '// MUST be the literal string "Self-arranged" — this agency does NOT book hotels';

  const accommodationContextLines: string[] = [];
  if (handlesAccommodation) {
    accommodationContextLines.push(`- Accommodation: ${validatedInput.accommodation}`);
    const notes = options.accommodationNotes?.trim();
    if (notes) {
      accommodationContextLines.push(`- Available hotels / pricing the agency can book:\n${notes}`);
    }
  } else {
    accommodationContextLines.push(
      '- Accommodation: Self-arranged (this agency does NOT book hotels; the visitor handles their own stay)'
    );
  }

  const accommodationRules = handlesAccommodation
    ? options.accommodationNotes?.trim()
      ? '\n- ACCOMMODATION: only recommend properties listed in the agency\'s inventory above. Do NOT invent hotels. If a region has no matching inventory, use a generic descriptor (e.g. "Selected 4-star hotel in Aswan") rather than a fabricated name.'
      : ''
    : '\n- ACCOMMODATION: this agency does NOT book hotels. Set EVERY day\'s `accommodation` field to "Self-arranged". Do NOT mention specific hotels by name. Do NOT include hotel/accommodation lines in `inclusions`. The visitor is arranging their own stay.';

  return generateStructuredWithCopilot({
    agencyId: options.agencyId,
    feature: 'tour-generation',
    schema: TourOutputSchema,
    systemPrompt:
      'You are an expert travel planner for Egypt itineraries. Return strict JSON only. The JSON MUST match the exact schema below — do not rename, omit, or add fields.',
    userPrompt: `Create a personalized tour package for the following traveler.

INPUT
- Travel Dates: ${validatedInput.travelDates.arrival} to ${validatedInput.travelDates.departure}
- Regions: ${validatedInput.region.join(', ')}
- Duration: ${validatedInput.duration} days
- Participants: ${validatedInput.participants}
${accommodationContextLines.join('\n')}
- Budget: ${validatedInput.budget.amount} ${validatedInput.budget.currency} per person
- Requested Inclusions: ${validatedInput.inclusions.join(', ')}
- Interests: ${validatedInput.interests.join(', ')}
- Custom Preferences: ${validatedInput.customPreferences || 'None'}

OUTPUT SCHEMA — every field is REQUIRED. Return JSON exactly matching this shape:
{
  "tourName": string,                    // marketing-friendly name for the package
  "summary": string,                     // 2-3 sentence overview
  "totalPrice": number,                  // total price for ALL participants combined, as a number
  "currency": string,                    // 3-letter code, e.g. "USD"
  "itinerary": [
    {
      "day": number,                     // 1-indexed
      "title": string,                   // short title for the day
      "description": string,             // 1-2 sentence overview of the day
      "activities": string[],            // 3-5 concrete activities
      "accommodation": string,           ${accommodationSchemaComment}
      "meals": string[]                  // e.g. ["Breakfast","Lunch","Dinner"] — list only the meals included${enrichmentSchema}
    }
  ],
  "inclusions": string[],                // what the price covers
  "exclusions": string[],                // what the price does NOT cover
  "transportationDetails": string        // 1-2 sentences on transfers, flights, drivers, etc.
}

RULES
- Itinerary length MUST equal ${validatedInput.duration}.
- Use realistic Egypt pricing; totalPrice is a NUMBER, not a string with a currency symbol.${accommodationRules}
- Keep every string field non-empty.
- Return ONLY the JSON object — no prose, no markdown fences.${enrichmentRules}`,
    temperature: 0.6,
  });
}
