// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative tours based on the current shopping cart content.
 *
 * - suggestAlternativeTours - A function that takes a list of tour descriptions and suggests alternative tours.
 * - SuggestAlternativeToursInput - The input type for the suggestAlternativeTours function.
 * - SuggestAlternativeToursOutput - The return type for the suggestAlternativeTours function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeToursInputSchema = z.object({
  tourDescriptions: z
    .array(z.string())
    .describe('A list of descriptions of tours currently in the shopping cart.'),
});
export type SuggestAlternativeToursInput = z.infer<typeof SuggestAlternativeToursInputSchema>;

const SuggestAlternativeToursOutputSchema = z.object({
  alternativeTours: z
    .array(z.string())
    .describe('A list of suggested alternative tours based on the cart content.'),
});
export type SuggestAlternativeToursOutput = z.infer<typeof SuggestAlternativeToursOutputSchema>;

export async function suggestAlternativeTours(input: SuggestAlternativeToursInput): Promise<SuggestAlternativeToursOutput> {
  return suggestAlternativeToursFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeToursPrompt',
  input: {schema: SuggestAlternativeToursInputSchema},
  output: {schema: SuggestAlternativeToursOutputSchema},
  prompt: `You are a tour suggestion expert. Given the following list of tours in the user\'s shopping cart, suggest alternative tours that the user might be interested in. Consider tours that are similar to the ones in the cart, or that would complement the existing tours.

Tours in cart:
{{#each tourDescriptions}}- {{{this}}}
{{/each}}`,
});

const suggestAlternativeToursFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeToursFlow',
    inputSchema: SuggestAlternativeToursInputSchema,
    outputSchema: SuggestAlternativeToursOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
