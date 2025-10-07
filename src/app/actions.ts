'use server';

import { suggestAlternativeRoutes as suggestAlternativeRoutesFlow } from '@/ai/flows/dynamic-rerouting-on-disruptions';
import type { AlternativeRoutesInput, AlternativeRoutesOutput } from '@/ai/flows/dynamic-rerouting-on-disruptions';


export async function suggestAlternativeRoutes(
  input: AlternativeRoutesInput
): Promise<AlternativeRoutesOutput> {
  // In a real app, you might add authentication, logging, etc. here
  try {
    const output = await suggestAlternativeRoutesFlow(input);
    return output;
  } catch (error) {
    console.error('Error calling suggestAlternativeRoutesFlow:', error);
    throw new Error('Failed to get alternative route suggestions from AI.');
  }
}
