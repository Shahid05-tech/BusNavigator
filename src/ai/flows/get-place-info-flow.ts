'use server';

/**
 * @fileOverview An AI flow that provides interesting information about a specific place.
 *
 * - getPlaceInfo - A function that gets information about a location.
 * - PlaceInfoInput - The input type for the getPlaceInfo function.
 * - PlaceInfoOutput - The return type for the getPlaceInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlaceInfoInputSchema = z.object({
  placeName: z.string().describe('The name of the place to get information about.'),
});
export type PlaceInfoInput = z.infer<typeof PlaceInfoInputSchema>;

const PlaceInfoOutputSchema = z.object({
  information: z.string().describe('Interesting and helpful information about the specified place. Should be about 2-3 sentences long.'),
});
export type PlaceInfoOutput = z.infer<typeof PlaceInfoOutputSchema>;

export async function getPlaceInfo(
  input: PlaceInfoInput
): Promise<PlaceInfoOutput> {
  return getPlaceInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'placeInfoPrompt',
  input: {schema: PlaceInfoInputSchema},
  output: {schema: PlaceInfoOutputSchema},
  prompt: `You are a friendly and knowledgeable local tour guide.

A user is traveling to the following location in or around Mangalore, India: {{{placeName}}}.

Tell them one interesting, fun, or special fact about this place. Keep it concise and engaging, like a real tour guide would. For example, mention a famous landmark, a historical fact, or a popular local spot.
`,
});

const getPlaceInfoFlow = ai.defineFlow(
  {
    name: 'getPlaceInfoFlow',
    inputSchema: PlaceInfoInputSchema,
    outputSchema: PlaceInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
