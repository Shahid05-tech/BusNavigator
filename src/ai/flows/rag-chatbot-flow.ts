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
  tools: [getPlaceInfoTool],
  prompt: `You are a helpful and friendly chatbot for the Bus Navigator app.
Your goal is to answer the user's question.

1.  If the user asks about a specific place, landmark, or location, use the 'getPlaceInfo' tool to get information.
2.  For all other questions (like features of the Bus Navigator app, blog content, etc.), answer based *only* on the CONTEXT provided below.
3.  Do not make up information or answer questions that are not related to the context or the available tool.
4.  If the answer is not available in the context and no tool is appropriate, politely say that you cannot find the answer.

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
    
    // Check if the model decided to use a tool
    const toolResponse = response.toolRequest?.content();
    if(toolResponse) {
       return { answer: toolResponse };
    }

    return response.output!;
  }
);
