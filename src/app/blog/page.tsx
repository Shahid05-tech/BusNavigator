"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import { askBlogChatbot } from "./actions";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function BlogPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Welcome! I'm your AI assistant for Bus Navigator. You can ask me about bus routes, interesting places, or features of the app. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const botResponse = await askBlogChatbot(input);
      const botMessage: Message = { sender: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "I'm sorry, but I'm having trouble connecting to my knowledge base. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-between h-16 px-6 bg-card border-b shadow-sm z-10">
        <a href="/" className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-semibold font-headline text-foreground">
            AI Assistant
          </h1>
        </a>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl flex flex-col h-full">
           <Card className="shadow-lg flex-1 flex flex-col">
             <CardHeader className="border-b">
                 <CardTitle className="font-headline flex items-center gap-2">
                     <Sparkles className="text-primary"/>
                     Bus Navigator AI
                 </CardTitle>
                 <CardDescription>Ask me about routes, places, or app features.</CardDescription>
             </CardHeader>
             <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                 {messages.map((message, index) => (
                     <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                         {message.sender === 'bot' && (
                             <Avatar className="w-8 h-8 border-2 border-primary">
                                 <AvatarFallback>AI</AvatarFallback>
                             </Avatar>
                         )}
                         <div className={`rounded-lg px-4 py-2 max-w-sm ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                           <p className="text-sm">{message.text}</p>
                         </div>
                     </div>
                 ))}
                 {isLoading && (
                     <div className="flex items-start gap-3">
                         <Avatar className="w-8 h-8 border-2 border-primary">
                             <AvatarFallback>AI</AvatarFallback>
                         </Avatar>
                         <div className="rounded-lg px-4 py-2 bg-secondary flex items-center">
                            <LoaderCircle className="w-5 h-5 animate-spin"/>
                         </div>
                     </div>
                 )}
             </CardContent>
             <div className="p-4 border-t">
                 <div className="flex gap-2">
                     <Input
                         value={input}
                         onChange={(e) => setInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         placeholder="Ask 'How do I get to Kankanady?'"
                         disabled={isLoading}
                     />
                     <Button onClick={handleSendMessage} disabled={isLoading}>
                         <Send className="w-4 h-4"/>
                     </Button>
                 </div>
             </div>
           </Card>
        </div>
      </main>
    </div>
  );
}
