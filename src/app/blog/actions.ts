"use server";

import { askChatbot } from "@/ai/flows/rag-chatbot-flow";

export async function askBlogChatbot(query: string): Promise<string> {
  try {
    const response = await askChatbot(query);
    return response.answer;
  } catch (error) {
    console.error("Error calling RAG chatbot flow:", error);
    throw new Error("Failed to get an answer from the chatbot.");
  }
}
