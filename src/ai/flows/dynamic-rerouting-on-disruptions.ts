'use server';

/**
 * @fileOverview A dynamic rerouting AI agent that suggests alternative routes based on disruptions.
 *
 * - suggestAlternativeRoutes - A function that handles the alternative route suggestion process.
 * - AlternativeRoutesInput - The input type for the suggestAlternativeRoutes function.
 * - AlternativeRoutesOutput - The return type for the suggestAlternativeRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlternativeRoutesInputSchema = z.object({
  currentLocation: z.string().describe('The user\'s current location.'),
  destination: z.string().describe('The user\'s desired destination.'),
  plannedRoute: z.string().describe('The user\'s originally planned route.'),
  disruptionDetails: z
    .string()
    .describe('Details about the disruption on the planned route, such as traffic jams or accidents.'),
});
export type AlternativeRoutesInput = z.infer<typeof AlternativeRoutesInputSchema>;

const AlternativeRoutesOutputSchema = z.object({
  alternativeRouteSuggestions: z
    .array(z.string())
    .describe('An array of suggested alternative routes to avoid the disruption.'),
  estimatedArrivalTimes: z
    .array(z.string())
    .describe('Estimated arrival times for each alternative route.'),
  reasoning: z.string().describe('The reasoning behind the alternative route suggestions.'),
});
export type AlternativeRoutesOutput = z.infer<typeof AlternativeRoutesOutputSchema>;

export async function suggestAlternativeRoutes(
  input: AlternativeRoutesInput
): Promise<AlternativeRoutesOutput> {
  return suggestAlternativeRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'alternativeRoutesPrompt',
  input: {schema: AlternativeRoutesInputSchema},
  output: {schema: AlternativeRoutesOutputSchema},
  prompt: `You are a helpful AI assistant that suggests alternative bus routes based on disruptions.

You will receive the user's current location, desired destination, planned route, and details about disruptions on the planned route.

Based on this information, suggest alternative routes that avoid the disruption and provide estimated arrival times for each alternative route.

Current Location: {{{currentLocation}}}
Destination: {{{destination}}}
Planned Route: {{{plannedRoute}}}
Disruption Details: {{{disruptionDetails}}}

Consider multiple possible routes, weigh the pros and cons of each, and explain your reasoning for your suggested alternative routes.

Output the alternative routes in an array called alternativeRouteSuggestions, the estimated arrival times in an array called estimatedArrivalTimes, and the reasoning behind your suggestions in a field called reasoning.
`,
});

const suggestAlternativeRoutesFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeRoutesFlow',
    inputSchema: AlternativeRoutesInputSchema,
    outputSchema: AlternativeRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
