"use server";

/**
 * @fileOverview A RAG-based chatbot that answers questions based on blog content.
 *
 * - askChatbot - The main function to interact with the chatbot.
 * - ChatbotInput - The input type for the chatbot flow.
 * - ChatbotOutput - The return type for the chatbot flow.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";
import { getBlogContentAsText } from "@/lib/blog-data";

const ChatbotInputSchema = z.string();
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  answer: z.string().describe("The generated answer to the user's question, based on the provided blog context."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

// The main exported function that the server action will call
export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return ragChatbotFlow(input);
}

// Define the prompt for the RAG chatbot
const ragPrompt = ai.definePrompt({
  name: "ragChatbotPrompt",
  input: {
    schema: z.object({
      query: z.string(),
      context: z.string(),
    }),
  },
  output: { schema: ChatbotOutputSchema },
  prompt: `You are a helpful and friendly chatbot for the Bus Navigator blog.
Your goal is to answer the user's question based *only* on the context provided below.
Do not make up information or answer questions that are not related to the context.
If the answer is not available in the context, politely say that you cannot find the answer in the blog posts.

CONTEXT:
{{{context}}}

USER QUESTION:
{{{query}}}

Based on the context, what is the answer?
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
    // In a real-world app, this step would involve a vector search to find the most relevant documents.
    // For this example, we will provide all blog content as context.
    const context = getBlogContentAsText();

    // 2. Generation: Pass the query and context to the LLM.
    const { output } = await ragPrompt({ query, context });
    return output!;
  }
);
