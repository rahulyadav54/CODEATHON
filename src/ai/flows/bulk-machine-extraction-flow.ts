'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting machine data from handwritten documents.
 * It uses multimodal AI to process images or PDFs of inventory logs.
 *
 * - bulkMachineExtraction - The main function to extract machine lists from documents.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BulkMachineExtractionInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The document (PDF or Image) as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type BulkMachineExtractionInput = z.infer<typeof BulkMachineExtractionInputSchema>;

const ExtractedMachineSchema = z.object({
  id: z.string().describe('The machine ID found in the text (e.g. CNC-101)'),
  name: z.string().describe('The descriptive name of the machine'),
  type: z.string().describe('The category/type of machine (CNC, 3D Printer, etc.)'),
  centerId: z.string().describe('The center ID or name (e.g. c1, Chennai)'),
});

const BulkMachineExtractionOutputSchema = z.object({
  machines: z.array(ExtractedMachineSchema).describe('The list of extracted machine objects.'),
  rawSummary: z.string().describe('A brief summary of what was found in the document.'),
});

export type BulkMachineExtractionOutput = z.infer<typeof BulkMachineExtractionOutputSchema>;

export async function bulkMachineExtraction(
  input: BulkMachineExtractionInput
): Promise<BulkMachineExtractionOutput> {
  return bulkMachineExtractionFlow(input);
}

const bulkMachineExtractionPrompt = ai.definePrompt({
  name: 'bulkMachineExtractionPrompt',
  input: { schema: BulkMachineExtractionInputSchema },
  output: { schema: BulkMachineExtractionOutputSchema },
  prompt: `You are an expert data entry assistant for CODEATHON AI. 
Your task is to analyze the provided handwritten or printed document, which is an inventory log of industrial machinery.

Extract all machines listed in the document. For each machine, try to identify:
- A unique ID (usually something like CNC-XXX or PRNT-XXX)
- The Name of the equipment
- The Type (e.g., CNC, 3D Printer, Welding, Robotics)
- The Center/Location ID it belongs to.

Document: {{media url=fileDataUri}}

If the handwriting is unclear, make your best professional guess. 
Ensure the output is a clean list of machine objects.`,
});

const bulkMachineExtractionFlow = ai.defineFlow(
  {
    name: 'bulkMachineExtractionFlow',
    inputSchema: BulkMachineExtractionInputSchema,
    outputSchema: BulkMachineExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await bulkMachineExtractionPrompt(input);
    return output!;
  }
);
