'use server';
/**
 * @fileOverview Generates detailed explanations of predicted machine failures and suggests actionable preventative measures.
 *
 * - predictiveMaintenanceInsightGen - A function that handles the generation of maintenance insights.
 * - PredictiveMaintenanceInsightGenInput - The input type for the predictiveMaintenanceInsightGen function.
 * - PredictiveMaintenanceInsightGenOutput - The return type for the predictiveMaintenanceInsightGen function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictiveMaintenanceInsightGenInputSchema = z.object({
  machineId: z.string().describe('The unique identifier of the machine.'),
  prediction: z.string().describe('The predicted failure alert message.'),
  usageHours: z.number().describe('Total hours the machine has been in operation.'),
  lastMaintenanceDate: z
    .string()
    .describe('The date of the last scheduled maintenance in YYYY-MM-DD format.'),
  maintenanceHistory: z.array(z.string()).describe('A list of past maintenance events and their outcomes.'),
  currentSensorData: z.record(z.any()).describe('Current real-time sensor data (e.g., temperature, vibration) as a JSON object.'),
});
export type PredictiveMaintenanceInsightGenInput = z.infer<
  typeof PredictiveMaintenanceInsightGenInputSchema
>;

const PredictiveMaintenanceInsightGenOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the predicted issue and its potential causes.'),
  preventativeMeasures: z
    .array(z.string())
    .describe('A list of actionable preventative measures to avert the predicted failure.'),
  severity: z.enum(['High', 'Medium', 'Low']).describe('The severity level of the predicted issue.'),
});
export type PredictiveMaintenanceInsightGenOutput = z.infer<
  typeof PredictiveMaintenanceInsightGenOutputSchema
>;

export async function predictiveMaintenanceInsightGen(
  input: PredictiveMaintenanceInsightGenInput
): Promise<PredictiveMaintenanceInsightGenOutput> {
  return predictiveMaintenanceInsightGenFlow(input);
}

const predictiveMaintenanceInsightGenPrompt = ai.definePrompt({
  name: 'predictiveMaintenanceInsightGenPrompt',
  input: { schema: PredictiveMaintenanceInsightGenInputSchema },
  output: { schema: PredictiveMaintenanceInsightGenOutputSchema },
  prompt: `You are an expert maintenance engineer and AI system analyst. Your task is to analyze machine data and predict potential failures, providing clear explanations and actionable preventative measures.

Analyze the following information to generate a detailed explanation of the predicted issue and suggest specific preventative measures. Also, determine the severity of the predicted issue.

Machine ID: {{{machineId}}}
Predicted Alert: {{{prediction}}}
Total Usage Hours: {{{usageHours}}} hours
Last Maintenance Date: {{{lastMaintenanceDate}}}
Maintenance History:
{{#each maintenanceHistory}}- {{{this}}}
{{/each}}
Current Sensor Data (JSON):
{{{JSON.stringify currentSensorData}}}

Based on this data, provide:
1. A detailed explanation of why the issue is predicted, considering usage patterns, maintenance history, and sensor data.
2. A list of specific, actionable preventative measures to take to avoid or mitigate the predicted failure.
3. The severity of this predicted issue (High, Medium, or Low).`,
});

const predictiveMaintenanceInsightGenFlow = ai.defineFlow(
  {
    name: 'predictiveMaintenanceInsightGenFlow',
    inputSchema: PredictiveMaintenanceInsightGenInputSchema,
    outputSchema: PredictiveMaintenanceInsightGenOutputSchema,
  },
  async (input) => {
    const { output } = await predictiveMaintenanceInsightGenPrompt(input);
    return output!;
  }
);
