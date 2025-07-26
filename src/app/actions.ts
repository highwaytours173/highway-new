
"use server";

import { suggestAlternativeTours } from '@/ai/flows/suggest-alternative-tours';
import { generateBlogPost } from '@/ai/flows/generate-blog-post';
import { z } from 'zod';

// For AI Suggestions in Cart
const SuggestionActionInputSchema = z.object({
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
    
    const validatedInput = SuggestionActionInputSchema.safeParse(rawInput);
    
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


// For AI Blog Post Generation
const BlogPostActionInputSchema = z.object({
  topic: z.string().min(5, { message: 'Please enter a topic with at least 5 characters.' }),
});

type BlogPostState = {
  message: string;
  content: string;
}

export async function generateBlogPostAction(prevState: BlogPostState, formData: FormData): Promise<BlogPostState> {
    try {
        const rawInput = {
            topic: formData.get('topic') as string,
        };

        const validatedInput = BlogPostActionInputSchema.safeParse(rawInput);

        if (!validatedInput.success) {
            return { message: validatedInput.error.errors[0].message, content: '' };
        }

        const result = await generateBlogPost(validatedInput.data);

        if (!result.content) {
            return { message: 'Could not generate content based on the topic.', content: '' };
        }

        return { message: 'Success', content: result.content };
    } catch (error) {
        console.error(error);
        return { message: 'An unexpected error occurred. Please try again.', content: '' };
    }
}
