"use server";

import { suggestAlternativeTours } from '@/ai/flows/suggest-alternative-tours';
import { z } from 'zod';

const ActionInputSchema = z.object({
  tourDescriptions: z.array(z.string()).min(1, { message: 'At least one tour description is required.' }),
});

type SuggestionsState = {
  message: string;
  suggestions: string[];
}

export async function getAiSuggestions(prevState: SuggestionsState, formData: FormData): Promise<SuggestionsState> {
  try {
    const rawInput = {
      tourDescriptions: formData.getAll('descriptions') as string[],
    };
    
    const validatedInput = ActionInputSchema.safeParse(rawInput);
    
    if (!validatedInput.success) {
      return { message: validatedInput.error.errors[0].message, suggestions: [] };
    }
    
    const result = await suggestAlternativeTours(validatedInput.data);
    
    if (result.alternativeTours.length === 0) {
      return { message: 'No alternative tours found.', suggestions: [] };
    }

    return { message: 'Success', suggestions: result.alternativeTours };
  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred. Please try again.', suggestions: [] };
  }
}
