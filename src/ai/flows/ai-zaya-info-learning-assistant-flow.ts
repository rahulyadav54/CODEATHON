'use server';
/**
 * @fileOverview An AI assistant that answers student queries about machine operations, safety, training concepts,
 * and can summarize training manuals.
 *
 * - aiZayaInfoLearningAssistant - A function that handles the AI Zaya learning assistant process.
 * - AiZayaInfoLearningAssistantInput - The input type for the aiZayaInfoLearningAssistant function.
 * - AiZayaInfoLearningAssistantOutput - The return type for the aiZayaInfoLearningAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiZayaInfoLearningAssistantInputSchema = z.object({
  query: z
    .string()
    .describe('The student\'s question or request for information/summary.'),
  manualContent: z
    .string()
    .optional()
    .describe('Optional: The content of a training manual to be summarized.'),
});
export type AiZayaInfoLearningAssistantInput = z.infer<
  typeof AiZayaInfoLearningAssistantInputSchema
>;

const AiZayaInfoLearningAssistantOutputSchema = z.object({
  answer: z
    .string()
    .describe('AI Zaya\'s answer to the query or summary of the manual.'),
});
export type AiZayaInfoLearningAssistantOutput = z.infer<
  typeof AiZayaInfoLearningAssistantOutputSchema
>;

export async function aiZayaInfoLearningAssistant(
  input: AiZayaInfoLearningAssistantInput
): Promise<AiZayaInfoLearningAssistantOutput> {
  return aiZayaInfoLearningAssistantFlow(input);
}

const aiZayaInfoLearningAssistantPrompt = ai.definePrompt({
  name: 'aiZayaInfoLearningAssistantPrompt',
  input: {schema: AiZayaInfoLearningAssistantInputSchema},
  output: {schema: AiZayaInfoLearningAssistantOutputSchema},
  prompt: `You are AI Zaya, an expert learning assistant for CODEATHON AI. Your role is to provide clear, concise, and helpful information to students regarding machine operations, safety protocols, and training concepts. You can also summarize complex training manuals.

Instructions:
- If manualContent is provided, prioritize summarizing it according to the query or providing information based on its content.
- If only a query is provided, answer the student's question directly and comprehensively.
- Maintain a helpful and informative tone.

Student Query: {{{query}}}

{{#if manualContent}}
Training Manual Content:
"""
{{{manualContent}}}
"""
{{/if}}`,
});

const aiZayaInfoLearningAssistantFlow = ai.defineFlow(
  {
    name: 'aiZayaInfoLearningAssistantFlow',
    inputSchema: AiZayaInfoLearningAssistantInputSchema,
    outputSchema: AiZayaInfoLearningAssistantOutputSchema,
  },
  async input => {
    const {output} = await aiZayaInfoLearningAssistantPrompt(input);
    return output!;
  }
);
