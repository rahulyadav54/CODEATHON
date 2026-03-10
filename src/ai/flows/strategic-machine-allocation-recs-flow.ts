'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating strategic machine allocation recommendations.
 *
 * - strategicMachineAllocationRecs - A function that generates recommendations for optimizing machine allocation.
 * - StrategicMachineAllocationRecsInput - The input type for the strategicMachineAllocationRecs function.
 * - StrategicMachineAllocationRecsOutput - The return type for the strategicMachineAllocationRecs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategicMachineAllocationRecsInputSchema = z.object({
  machines: z
    .array(
      z.object({
        machineId: z.string().describe('Unique identifier for the machine.'),
        machineName: z.string().describe('Name of the machine.'),
        machineType: z.string().describe('Type of the machine (e.g., CNC, 3D Printer).'),
        centerId: z.string().describe('The ID of the center where the machine is currently located.'),
        usageHours: z.number().describe('Total usage hours for the machine over a period.'),
      })
    )
    .describe('List of all machines with their current status and usage data.'),
  centers: z
    .array(
      z.object({
        centerId: z.string().describe('Unique identifier for the skill development center.'),
        centerName: z.string().describe('Name of the center.'),
        demandLevel: z.enum(['low', 'medium', 'high']).describe('Current demand level for machines at this center.'),
      })
    )
    .describe('List of all skill development centers with their demand levels.'),
});
export type StrategicMachineAllocationRecsInput = z.infer<
  typeof StrategicMachineAllocationRecsInputSchema
>;

const StrategicMachineAllocationRecsOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        machineId: z.string().describe('The ID of the machine recommended for relocation.'),
        machineName: z.string().describe('The name of the machine recommended for relocation.'),
        currentCenterId: z.string().describe('The ID of the center where the machine is currently located.'),
        recommendedCenterId: z.string().describe('The ID of the center to which the machine should be moved.'),
        reason: z.string().describe('A brief explanation for the recommendation.'),
      })
    )
    .describe('List of recommendations for optimizing machine allocation.'),
  insights: z.array(z.string()).describe('General insights about machine utilization across centers.'),
});
export type StrategicMachineAllocationRecsOutput = z.infer<
  typeof StrategicMachineAllocationRecsOutputSchema
>;

export async function strategicMachineAllocationRecs(
  input: StrategicMachineAllocationRecsInput
): Promise<StrategicMachineAllocationRecsOutput> {
  return strategicMachineAllocationRecsFlow(input);
}

const strategicMachineAllocationRecsPrompt = ai.definePrompt({
  name: 'strategicMachineAllocationRecsPrompt',
  input: {schema: StrategicMachineAllocationRecsInputSchema},
  output: {schema: StrategicMachineAllocationRecsOutputSchema},
  prompt: `You are an expert AI system designed to optimize machine allocation across multiple skill development centers.
Your goal is to analyze machine utilization data and center demand levels to provide strategic recommendations.

Input Data:

Machines:
{{#each machines}}
  - Machine ID: {{{machineId}}}, Name: {{{machineName}}}, Type: {{{machineType}}}, Current Center ID: {{{centerId}}}, Usage Hours: {{{usageHours}}}
{{/each}}

Centers:
{{#each centers}}
  - Center ID: {{{centerId}}}, Name: {{{centerName}}}, Demand Level: {{{demandLevel}}}
{{/each}}

Instructions:
1. Identify machines that are significantly underutilized (e.g., very low usage hours) in centers with 'low' or 'medium' demand.
2. Identify centers with 'high' demand that could benefit from additional machines, especially if they are lacking certain machine types.
3. Formulate recommendations to move underutilized machines from lower-demand centers to high-demand centers to maximize resource efficiency.
4. Provide a clear reason for each recommendation, explaining why the specific machine should be moved to the suggested center.
5. Include general insights about the overall machine utilization and center performance.

Generate the output in the specified JSON format, focusing on actionable recommendations and relevant insights.
`,
});

const strategicMachineAllocationRecsFlow = ai.defineFlow(
  {
    name: 'strategicMachineAllocationRecsFlow',
    inputSchema: StrategicMachineAllocationRecsInputSchema,
    outputSchema: StrategicMachineAllocationRecsOutputSchema,
  },
  async input => {
    const {output} = await strategicMachineAllocationRecsPrompt(input);
    return output!;
  }
);
