// 'use server';

/**
 * @fileOverview This file suggests alternative tours based on the current shopping cart content.
 *
 * - suggestAlternativeTours - A function that takes a list of tour descriptions and suggests alternative tours.
 * - SuggestAlternativeToursInput - The input type for the suggestAlternativeTours function.
 * - SuggestAlternativeToursOutput - The return type for the suggestAlternativeTours function.
 */

"use server";

import { generateStructuredWithOpenRouter } from '@/lib/ai/openrouter';
import { z } from 'zod';

const SuggestAlternativeToursInputSchema = z.object({
  tourDescriptions: z
    .array(z.string())
    .describe(
      'A list of descriptions of tours currently in the shopping cart.',
    ),
});
export type SuggestAlternativeToursInput = z.infer<
  typeof SuggestAlternativeToursInputSchema
>;

const SuggestAlternativeToursOutputSchema = z.object({
  alternativeTours: z
    .array(z.string())
    .describe(
      'A list of suggested alternative tours based on the cart content.',
    ),
});
export type SuggestAlternativeToursOutput = z.infer<
  typeof SuggestAlternativeToursOutputSchema
>;

export async function suggestAlternativeTours(
  input: SuggestAlternativeToursInput,
): Promise<SuggestAlternativeToursOutput> {
  const validatedInput = SuggestAlternativeToursInputSchema.parse(input);

  return generateStructuredWithOpenRouter({
    schema: SuggestAlternativeToursOutputSchema,
    systemPrompt:
      'You are a travel recommendation assistant. Return valid JSON matching the output schema.',
    userPrompt: `Given the tours below, suggest exactly 4 alternative tour ideas. Keep each suggestion concise and specific.

Tours in cart:
${validatedInput.tourDescriptions.map((description) => `- ${description}`).join('\n')}`,
    temperature: 0.6,
  });
}
