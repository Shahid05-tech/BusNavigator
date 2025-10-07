"use server";

/**
 * @fileOverview A RAG-based chatbot that answers questions based on blog content and can provide information about places.
 *
 * - askChatbot - The main function to interact with the chatbot.
 * - ChatbotInput - The input type for the chatbot flow.
 * - ChatbotOutput - The return type for the chatbot flow.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { getBlogContentAsText } from "@/lib/blog-data";
import { findSuggestedRoutes } from "@/lib/route-finder";
import { initialBuses, routes, stops } from "@/lib/data";

// Define the tool for getting place information
const getPlaceInfoTool = ai.defineTool(
  {
    name: "getPlaceInfo",
    description: "Get interesting and helpful information about a specific place, such as a landmark, historical fact, or local spot in or around Mangalore, India.",
    inputSchema: z.object({
      placeName: z.string().describe("The name of the place to get information about."),
    }),
    outputSchema: z.object({
      information: z.string().describe("Interesting and helpful information about the specified place. Should be about 2-3 sentences long."),
    }),
  },
  async (input) => {
    // This is a simple implementation. In a real app, this could query a database or another API.
     const prompt = `You are a friendly and knowledgeable local tour guide. A user is traveling to the following location in or around Mangalore, India: ${input.placeName}. Tell them one interesting, fun, or special fact about this place. Keep it concise and engaging, like a real tour guide would. For example, mention a famous landmark, a historical fact, or a popular local spot.`;
     const { text } = await ai.generate({ prompt });
     return { information: text };
  }
);

// Define the tool for finding bus routes
const findBusRouteTool = ai.defineTool(
  {
    name: "findBusRoute",
    description: "Find bus routes between two locations. Use this when the user asks for bus times, when the next bus is, or how to get from one place to another.",
    inputSchema: z.object({
      origin: z.string().describe("The starting point or origin of the journey."),
      destination: z.string().describe("The destination of the journey."),
    }),
    outputSchema: z.string().describe("A formatted string describing the suggested bus routes, including bus names, route names, and estimated arrival times (ETAs)."),
  },
  async ({ origin, destination }) => {
    // Find the stop IDs from the names. This is a simple case-insensitive search.
    const originStop = stops.find(s => s.name.toLowerCase() === origin.toLowerCase());
    const destinationStop = stops.find(s => s.name.toLowerCase() === destination.toLowerCase());

    if (!originStop || !destinationStop) {
      return `I couldn't find one of the locations you mentioned. Please try using exact bus stop names like "Statebank" or "Kankanady".`;
    }

    const suggestedRoutes = findSuggestedRoutes({
      originId: originStop.id,
      destinationId: destinationStop.id,
      stops,
      routes,
      buses: initialBuses, // Using initial bus data for this simulation
    });

    if (suggestedRoutes.length === 0) {
      return `I couldn't find any bus routes from ${origin} to ${destination} at the moment.`;
    }
    
    // Format the response
    const formattedRoutes = suggestedRoutes.map(route => {
      if (route.type === 'direct') {
        const leg = route.legs[0];
        const eta = leg.eta > 0 ? `around ${leg.eta} minutes` : 'is on its way';
        return `You can take the ${leg.bus.name} bus on the "${leg.route.name}" route. The bus from ${leg.startStop.name} to ${leg.endStop.name} ${eta}.`;
      }
      return "I found a connecting route, but I can't describe it just yet.";
    }).join('\n');

    return `Here's what I found for your trip from ${origin} to ${destination}:\n${formattedRoutes}`;
  }
);

const ChatbotInputSchema = z.string();
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  answer: z.string().describe("The generated answer to the user's question, based on the provided blog context or the result of a tool call."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

// The main exported function that the server action will call
export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return ragChatbotFlow(input);
}

// Define the prompt for the RAG chatbot
const ragChatbotPrompt = ai.definePrompt({
  name: "ragChatbotPrompt",
  input: {
    schema: z.object({
      query: z.string(),
      context: z.string(),
    }),
  },
  output: { schema: ChatbotOutputSchema },
  // Give the model tools to use
  tools: [getPlaceInfoTool, findBusRouteTool],
  prompt: `You are a helpful and friendly chatbot for the Bus Navigator app.
Your goal is to answer the user's question based on the tools and context provided.

1.  **Bus Routes:** If the user asks about bus timings, how to get somewhere, or for the next bus, use the 'findBusRoute' tool. Extract the origin and destination from their question.
2.  **Place Information:** If the user asks about a specific place, landmark, or location, use the 'getPlaceInfo' tool to get information.
3.  **Blog Content:** For all other questions (like features of the Bus Navigator app, blog content, etc.), answer based *only* on the CONTEXT provided below.
4.  **Clarity:** If you don't have enough information to use a tool (e.g., you need both an origin and a destination for a route search), ask the user for the missing information.
5.  **Limitations:** Do not make up information. If the answer is not in the context and no tool is appropriate, politely say that you cannot find the answer.

CONTEXT:
{{{context}}}

USER QUESTION:
{{{query}}}

Based on the instructions, what is the answer?
`,
});

// Define the main RAG flow
const ragChatbotFlow = ai.defineFlow(
  {
    name: "ragChatbotFlow",
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (query) => {
    // 1. Retrieval: Get the knowledge base content.
    const context = getBlogContentAsText();

    // 2. Generation: Pass the query and context to the LLM.
    const response = await ragChatbotPrompt({ query, context });
    
    // Check if the model decided to use a tool and extract the result
    const toolResponse = response.toolRequest?.output();
    if(toolResponse) {
       // If the tool returns a string, use it. If it returns an object, stringify it.
       const answer = typeof toolResponse === 'string' ? toolResponse : JSON.stringify(toolResponse);
       return { answer: answer };
    }

    // If no tool was used, return the direct text output
    return response.output!;
  }
);
