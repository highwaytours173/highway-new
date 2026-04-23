"use server";

import { generateStructuredWithOpenRouter } from '@/lib/ai/openrouter';
import { z } from 'zod';

const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The topic or title for the blog post.'),
  keywords: z
    .string()
    .optional()
    .describe('A comma-separated list of keywords to include in the post.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  content: z
    .string()
    .describe('The generated blog post content, formatted in HTML.'),
});
export type GenerateBlogPostOutput = z.infer<
  typeof GenerateBlogPostOutputSchema
>;

export async function generateBlogPost(
  input: GenerateBlogPostInput,
): Promise<GenerateBlogPostOutput> {
  const validatedInput = GenerateBlogPostInputSchema.parse(input);

  return generateStructuredWithOpenRouter({
    schema: GenerateBlogPostOutputSchema,
    systemPrompt:
      'You are an expert travel blogger for a travel agency. Always return valid JSON matching the requested schema.',
    userPrompt: `Generate a full blog post based on the topic below.

Requirements:
- At least 500 words.
- Output must be HTML only in the content field.
- Use an engaging intro and compelling conclusion.
- Use <h2>, <h3>, <p>, <strong>, <ul>, and <li> where relevant.
- Include one or two contextual links to /tours.

Topic: ${validatedInput.topic}
${validatedInput.keywords ? `Keywords to include: ${validatedInput.keywords}` : ''}`,
    temperature: 0.7,
  });
}
