'use server';
/**
 * @fileOverview This flow analyzes technical documents and generates important Q&A and MCQs.
 *
 * - aiLearner - The main function to analyze documents and generate learning content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiLearnerInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The document (PDF, Image, or Text) as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  includeMcqs: z.boolean().describe('Whether to generate MCQs or not.'),
});

export type AiLearnerInput = z.infer<typeof AiLearnerInputSchema>;

const ImportantQASchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const MCQSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().min(0).max(3),
});

const AiLearnerOutputSchema = z.object({
  summary: z.string().describe('A brief overview of the document.'),
  importantQuestions: z.array(ImportantQASchema).describe('List of critical Q&A.'),
  mcqs: z.array(MCQSchema).optional().describe('List of 5 MCQs if requested.'),
});

export type AiLearnerOutput = z.infer<typeof AiLearnerOutputSchema>;

export async function aiLearner(
  input: AiLearnerInput
): Promise<AiLearnerOutput> {
  return aiLearnerFlow(input);
}

const aiLearnerPrompt = ai.definePrompt({
  name: 'aiLearnerPrompt',
  input: { schema: AiLearnerInputSchema },
  output: { schema: AiLearnerOutputSchema },
  prompt: `You are an expert technical educator for CODEATHON AI. 
Your task is to analyze the provided document (technical manual, machine guide, or training note).

Tasks:
1. Provide a concise summary of the core concepts.
2. Generate at least 5 "Important Questions and Answers" that a trainee must know for certification.
3. {{#if includeMcqs}}Generate 5 Multiple Choice Questions (MCQs) with 4 options each and indicate the correct answer index.{{/if}}

Document: {{media url=fileDataUri}}

Focus on technical accuracy and safety protocols mentioned in the text.`,
});

const aiLearnerFlow = ai.defineFlow(
  {
    name: 'aiLearnerFlow',
    inputSchema: AiLearnerInputSchema,
    outputSchema: AiLearnerOutputSchema,
  },
  async (input) => {
    const { output } = await aiLearnerPrompt(input);
    return output!;
  }
);
