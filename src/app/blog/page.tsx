"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import { askBlogChatbot } from "./actions";
import { blogContent } from "@/lib/blog-data";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function BlogPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Welcome to the Bus Navigator blog! I'm here to answer your questions about our service based on our blog posts. How can I help you?",
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary"><path d="M10 20.5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-2.04c0-.15.04-.3.1-.44L17 15h-1.5c-1.1 0-2.12-.6-2.65-1.59L12 12l-1.05-1.59C10.42 9.6 9.4 9 8.3 9H7l3.9 3.06c.06.05.1.12.1.2V18.5Z"/><path d="M19 12h-1.5c-.83 0-1.5-.67-1.5-1.5v-2c0-.83.67-1.5 1.5-1.5H19c1.1 0 2 .9 2 2v1c0 .55-.45 1-1 1Z"/><path d="M7 9H5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h1.5c.83 0 1.5-.67 1.5-1.5v-2C7.5 9.67 6.83 9 6 9Z"/><path d="m9.37 5.5.63-.5C10.5 4.5 11.22 4 12 4s1.5.5 2 .99l.63.51"/><path d="M6 9H5c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1Z"/></svg>
          <h1 className="text-2xl font-semibold font-headline text-foreground">
            Bus Navigator Blog
          </h1>
        </a>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 min-h-0">
        {/* Blog Content Section */}
        <div className="md:col-span-2 flex flex-col gap-6 overflow-y-auto">
          <h2 className="font-headline text-3xl text-primary">Our Latest Posts</h2>
          {blogContent.map((post) => (
            <Card key={post.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">{post.title}</CardTitle>
                <CardDescription>{post.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.content.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">{paragraph}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chatbot Section */}
        <div className="md:col-span-1 flex flex-col">
           <Card className="shadow-lg flex-1 flex flex-col">
             <CardHeader className="border-b">
                 <CardTitle className="font-headline flex items-center gap-2">
                     <Sparkles className="text-primary"/>
                     Ask the Blog Bot
                 </CardTitle>
                 <CardDescription>Get answers from our blog posts.</CardDescription>
             </CardHeader>
             <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                 {messages.map((message, index) => (
                     <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                         {message.sender === 'bot' && (
                             <Avatar className="w-8 h-8 border-2 border-primary">
                                 <AvatarFallback>BN</AvatarFallback>
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
                             <AvatarFallback>BN</AvatarFallback>
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
                         placeholder="Ask about our features..."
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
