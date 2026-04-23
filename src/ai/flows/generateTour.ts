import { generateStructuredWithOpenRouter } from '@/lib/ai/openrouter';
import { TourInputSchema, TourOutputSchema } from '@/types/tour-schemas';
import { z } from 'zod';

export { TourInputSchema, TourOutputSchema };

export type GenerateTourInput = z.infer<typeof TourInputSchema>;
export type GenerateTourOutput = z.infer<typeof TourOutputSchema>;

export async function generateTourFlow(input: GenerateTourInput): Promise<GenerateTourOutput> {
  const validatedInput = TourInputSchema.parse(input);

  return generateStructuredWithOpenRouter({
    schema: TourOutputSchema,
    systemPrompt:
      'You are an expert travel planner for Egypt itineraries. Return valid JSON that exactly matches the requested schema.',
    userPrompt: `Create a personalized tour package using the following details:

- Travel Dates: ${validatedInput.travelDates.arrival} to ${validatedInput.travelDates.departure}
- Regions: ${validatedInput.region.join(', ')}
- Duration: ${validatedInput.duration} days
- Participants: ${validatedInput.participants}
- Accommodation: ${validatedInput.accommodation}
- Budget: ${validatedInput.budget.amount} ${validatedInput.budget.currency} per person
- Requested Inclusions: ${validatedInput.inclusions.join(', ')}
- Interests: ${validatedInput.interests.join(', ')}
- Custom Preferences: ${validatedInput.customPreferences || 'None'}

Output rules:
- Use realistic pricing and keep totalPrice as a number.
- Include a day-by-day itinerary with useful detail.
- Keep inclusions/exclusions practical and specific.
- Provide clear transportationDetails.
- Return JSON only.`,
    temperature: 0.6,
  });
}



