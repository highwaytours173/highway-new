import { z } from 'zod';

export const TourInputSchema = z.object({
  travelDates: z.object({
    arrival: z.string(),
    departure: z.string(),
  }),
  region: z.array(z.string()),
  duration: z.number(),
  budget: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  // Free-form string so admins can customise accommodation_tiers in the
  // Tailor-Made Studio (e.g. "Boutique Nile cruise") without breaking the
  // generator's schema validation. Downstream the value is passed through
  // to the LLM as natural-language context.
  accommodation: z.string().min(2),
  participants: z.number().min(1).max(20),
  inclusions: z.array(z.string()),
  interests: z.array(z.string()),
  customPreferences: z.string().optional(),
});

export const ItineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
  activities: z.array(z.string()),
  accommodation: z.string(),
  meals: z.array(z.string()),

  // Optional enrichment fields. Populated by the LLM only when the agency's
  // tailor-made config has the corresponding toggle on — keeps response
  // size predictable for agencies that just want a clean day list.
  whyWePickedThis: z.string().optional(),
  whatToBring: z.array(z.string()).optional(),
  culturalNotes: z.string().optional(),
  restaurantPicks: z
    .array(z.object({ name: z.string(), note: z.string() }))
    .optional(),
  alternativeOptions: z
    .array(z.object({ label: z.string(), description: z.string() }))
    .optional(),
  localPhrases: z
    .array(z.object({ phrase: z.string(), translation: z.string() }))
    .optional(),
});

export const TourOutputSchema = z.object({
  tourName: z.string(),
  summary: z.string(),
  totalPrice: z.number(),
  currency: z.string(),
  itinerary: z.array(ItineraryDaySchema),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  transportationDetails: z.string(),
});

export type TourInput = z.infer<typeof TourInputSchema>;
export type TourOutput = z.infer<typeof TourOutputSchema>;
