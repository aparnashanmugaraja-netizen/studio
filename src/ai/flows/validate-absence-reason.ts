'use server';

/**
 * @fileOverview A flow to validate absence reasons using AI.
 *
 * - validateAbsenceReason - A function that validates an absence reason.
 * - ValidateAbsenceReasonInput - The input type for the validateAbsenceReason function.
 * - ValidateAbsenceReasonOutput - The return type for the validateAbsenceReason function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAbsenceReasonInputSchema = z.object({
  absenceReason: z
    .string()
    .describe('The reason provided for the absence.'),
});
export type ValidateAbsenceReasonInput = z.infer<typeof ValidateAbsenceReasonInputSchema>;

const ValidateAbsenceReasonOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the absence reason is valid or suspicious.'),
  explanation: z.string().describe('Explanation of why the absence reason is valid or not.'),
});
export type ValidateAbsenceReasonOutput = z.infer<typeof ValidateAbsenceReasonOutputSchema>;

export async function validateAbsenceReason(input: ValidateAbsenceReasonInput): Promise<ValidateAbsenceReasonOutput> {
  return validateAbsenceReasonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateAbsenceReasonPrompt',
  input: {schema: ValidateAbsenceReasonInputSchema},
  output: {schema: ValidateAbsenceReasonOutputSchema},
  prompt: `You are an AI assistant that validates absence reasons provided by students.

  Determine if the given absence reason is valid or suspicious based on common sense and typical student behavior.
  If the reason seems unlikely, suspicious, or potentially dishonest, mark it as invalid.
  Provide a brief explanation for your decision.

  Absence Reason: {{{absenceReason}}}
  `,
});

const validateAbsenceReasonFlow = ai.defineFlow(
  {
    name: 'validateAbsenceReasonFlow',
    inputSchema: ValidateAbsenceReasonInputSchema,
    outputSchema: ValidateAbsenceReasonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
