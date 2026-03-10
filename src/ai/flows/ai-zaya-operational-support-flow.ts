'use server';
/**
 * @fileOverview This file implements the AI Zaya operational support flow.
 * It provides an AI assistant that analyzes user skill levels, suggests machines based on utilization,
 * and recommends time slots.
 *
 * - aiZayaOperationalSupport - The main function to call the AI Zaya operational support flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiZayaOperationalSupportInputSchema = z.object({
  studentQuery: z.string().describe('The student\'s question or problem description.'),
  userProfile: z.object({
    name: z.string(),
    role: z.string(),
    skillLevel: z.enum(['Beginner', 'Intermediate', 'Expert']),
    totalHours: z.number(),
    bookingHistory: z.array(z.string())
  }).describe('The current user\'s profile and history.'),
  machineFleet: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      status: z.string(),
      usageHours: z.number(),
      healthScore: z.number()
    })
  ).describe('The current state of all machines.'),
  centerDemand: z.array(z.any())
});

export type AiZayaOperationalSupportInput = z.infer<typeof AiZayaOperationalSupportInputSchema>;

const AiZayaOperationalSupportOutputSchema = z.object({
  answer: z.string().describe('The AI Zaya\'s response.'),
  skillAnalysis: z.string().optional().describe('Analysis of why the user is categorized as Beginner, Intermediate, or Expert.'),
  suggestedMachineId: z.string().optional().describe('ID of a suggested machine.'),
  suggestedSlot: z.string().optional().describe('A recommended free time slot.'),
});

export type AiZayaOperationalSupportOutput = z.infer<typeof AiZayaOperationalSupportOutputSchema>;

export async function aiZayaOperationalSupport(
  input: AiZayaOperationalSupportInput
): Promise<AiZayaOperationalSupportOutput> {
  return aiZayaOperationalSupportFlow(input);
}

const aiZayaOperationalSupportPrompt = ai.definePrompt({
  name: 'aiZayaOperationalSupportPrompt',
  input: { schema: AiZayaOperationalSupportInputSchema },
  output: { schema: AiZayaOperationalSupportOutputSchema },
  prompt: `You are AI Zaya, an expert operational support assistant for the CODEATHON AI platform.
You have access to the user's profile and the entire machine fleet state.

Your tasks:
1. Analyze User Level:
   - Beginner: < 20 hours, no CNC/Welding history.
   - Intermediate: 20-100 hours, some CNC experience.
   - Expert: > 100 hours or complex machine history.
   Explain your analysis if the user asks.

2. Smart Suggestions:
   - If a machine type (like CNC) is high utilization (e.g. > 80% used in fleet), suggest an alternative (e.g. Lathe or 3D Printer).
   - Suggest machines suitable for their skill level.
   - If they ask for a booking, recommend a free slot (Standard slots: 09-11, 11-01, 02-04, 04-06).

3. Troubleshooting:
   - Provide technical steps for any issue described.

User Profile: {{{json userProfile}}}
Current Fleet: {{{json machineFleet}}}

User Query: {{{studentQuery}}}

Respond in a helpful, technical, yet friendly tone. If suggestions are made, include the machineId and suggestedSlot in the structured output fields.
`,
});

const aiZayaOperationalSupportFlow = ai.defineFlow(
  {
    name: 'aiZayaOperationalSupportFlow',
    inputSchema: AiZayaOperationalSupportInputSchema,
    outputSchema: AiZayaOperationalSupportOutputSchema,
  },
  async (input) => {
    const { output } = await aiZayaOperationalSupportPrompt(input);
    return output!;
  }
);
