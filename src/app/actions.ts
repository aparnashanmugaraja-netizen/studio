"use server";

import { validateAbsenceReason } from '@/ai/flows/validate-absence-reason';

export async function getAbsenceValidation(reason: string) {
  try {
    const result = await validateAbsenceReason({ absenceReason: reason });
    return result;
  } catch (error) {
    console.error("Error validating absence reason:", error);
    return {
      isValid: false,
      explanation: "Could not validate reason due to an internal error."
    };
  }
}
