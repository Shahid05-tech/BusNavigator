'use server';

import { suggestAlternativeRoutes as suggestAlternativeRoutesFlow } from '@/ai/flows/dynamic-rerouting-on-disruptions';
import type { AlternativeRoutesInput, AlternativeRoutesOutput } from '@/ai/flows/dynamic-rerouting-on-disruptions';
import { getPlaceInfo as getPlaceInfoFlow } from '@/ai/flows/get-place-info-flow';
import type { PlaceInfoInput, PlaceInfoOutput } from '@/ai/flows/get-place-info-flow';

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

export async function getPlaceInfo(
  input: PlaceInfoInput
): Promise<PlaceInfoOutput> {
  try {
    const output = await getPlaceInfoFlow(input);
    return output;
  } catch (error) {
    console.error('Error calling getPlaceInfoFlow:', error);
    throw new Error('Failed to get place information from AI.');
  }
}
