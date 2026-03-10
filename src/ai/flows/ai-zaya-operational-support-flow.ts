'use server';
/**
 * @fileOverview This file implements the AI Zaya operational support flow.
 * It provides an AI assistant that can answer student queries, suggest available machines based on provided data,
 * and offer step-by-step guidance for troubleshooting common machine issues.
 *
 * - aiZayaOperationalSupport - The main function to call the AI Zaya operational support flow.
 * - AiZayaOperationalSupportInput - The input type for the aiZayaOperationalSupport function.
 * - AiZayaOperationalSupportOutput - The return type for the aiZayaOperationalSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AiZayaOperationalSupportInputSchema = z.object({
  studentQuery: z.string().describe('The student\'s question or problem description.'),
  availableMachines: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the machine.'),
      name: z.string().describe('The name of the machine.'),
      type: z.string().describe('The type of the machine (e.g., "CNC", "3D Printer").'),
      location: z.string().describe('The location where the machine is available.'),
      status: z.string().describe('The current status of the machine (e.g., "Available").')
    })
  ).describe('A list of currently available machines, including their details.'),
  commonMachineIssues: z.array(
    z.object({
      issue: z.string().describe('A description of the common machine issue.'),
      machineType: z.string().optional().describe('The type of machine this issue typically affects.'),
      troubleshootingSteps: z.array(z.string()).describe('Step-by-step instructions to troubleshoot the issue.')
    })
  ).describe('A list of common machine issues with their troubleshooting steps.')
});

export type AiZayaOperationalSupportInput = z.infer<typeof AiZayaOperationalSupportInputSchema>;

// Output Schema
const AiZayaOperationalSupportOutputSchema = z.object({
  answer: z.string().describe('The AI Zaya\'s comprehensive answer, providing machine suggestions or troubleshooting guidance.')
});

export type AiZayaOperationalSupportOutput = z.infer<typeof AiZayaOperationalSupportOutputSchema>;

// Exported wrapper function
export async function aiZayaOperationalSupport(
  input: AiZayaOperationalSupportInput
): Promise<AiZayaOperationalSupportOutput> {
  return aiZayaOperationalSupportFlow(input);
}

// Prompt Definition
const aiZayaOperationalSupportPrompt = ai.definePrompt({
  name: 'aiZayaOperationalSupportPrompt',
  input: { schema: AiZayaOperationalSupportInputSchema },
  output: { schema: AiZayaOperationalSupportOutputSchema },
  prompt: `You are AI Zaya, an expert operational support assistant for SkillMach AI platform.
Your goal is to help students efficiently proceed with their training or resolve minor problems quickly by:
1. Suggesting available machines for specific training needs based on the provided list.
2. Providing step-by-step guidance for troubleshooting common machine issues based on the provided list.

Always address the student directly and maintain a helpful, informative tone.

Here is the student's query:
Student Query: {{{studentQuery}}}

Here is a list of currently AVAILABLE machines:
{{#if availableMachines}}
Available Machines:
\`\`\`json
{{{json availableMachines}}}
\`\`\`
{{else}}
No machines are currently marked as Available.
{{/if}}

Here is a list of common machine issues and their troubleshooting steps:
{{#if commonMachineIssues}}
Common Machine Issues and Troubleshooting:
\`\`\`json
{{{json commonMachineIssues}}}
\`\`\`
{{else}}
No common machine issues and troubleshooting steps are currently available.
{{/if}}

Based on the student's query and the provided information, please provide a comprehensive answer.
If the student is asking about finding a machine, suggest relevant available machines.
If the student is describing a problem, provide detailed troubleshooting steps from the common issues list.
If you cannot find a direct match for troubleshooting, provide general advice and suggest contacting a trainer.
`,
});

// Flow Definition
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
