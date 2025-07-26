
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating blog post content.
 *
 * - generateBlogPost - A function that takes a topic and generates a blog post.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The topic or title for the blog post.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  content: z.string().describe('The generated blog post content, formatted in Markdown.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: {schema: GenerateBlogPostInputSchema},
  output: {schema: GenerateBlogPostOutputSchema},
  prompt: `You are an expert travel blogger writing for "Wanderlust Hub", a company specializing in tours of Egypt. Your tone is engaging, informative, and inspiring.

Generate a full blog post based on the following topic. The post should be at least 500 words long and formatted in Markdown.

It should include:
- An engaging introduction that hooks the reader.
- Several paragraphs that explore the topic in detail.
- Use headings and bullet points where appropriate to make the content easy to read.
- A concluding paragraph that summarizes the key points and encourages readers to book a tour.

Topic: {{{topic}}}`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
