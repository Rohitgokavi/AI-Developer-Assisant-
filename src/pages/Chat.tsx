import { Navigation } from "@/components/Navigation";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hello! I'm your AI coding assistant. I can help you with code generation, debugging, and programming questions. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatMessage = (content: string) => {
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let codeBlockIndex = 0;

    // Match code blocks with ```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {formatInlineText(textBefore)}
          </div>
        );
      }

      // Add code block
      const language = match[1] || "code";
      const code = match[2].trim();
      const blockIndex = codeBlockIndex++;
      
      parts.push(
        <div key={`code-${match.index}`} className="relative my-3 group">
          <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border-b border-border">
            <span className="text-xs text-muted-foreground font-mono">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard(code, blockIndex)}
            >
              {copiedIndex === blockIndex ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-b-lg overflow-x-auto">
            <code className="text-sm font-mono text-primary">{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      parts.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {formatInlineText(remainingText)}
        </div>
      );
    }

    return <>{parts}</>;
  };

  const formatInlineText = (text: string) => {
    // Format inline code with `code`
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code key={index} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
            {code}
          </code>
        );
      }
      return part;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantMessage = "";
    setMessages((prev) => [...prev, { role: "assistant" as const, content: "" }]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        }
      );

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 402) {
          toast.error("Payment required. Please add funds to continue.");
        } else {
          toast.error("Failed to get response from AI");
        }
        setMessages((prev) => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Developer Assistant
            </h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Your intelligent coding companion for generation, debugging, and learning
          </p>

          <Card className="h-[calc(100%-8rem)] flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                          msg.role === "user"
                            ? "bg-gradient-primary text-primary-foreground shadow-glow-primary"
                            : "bg-card border border-border shadow-lg"
                        }`}
                      >
                        <div className="text-sm font-medium mb-2 opacity-70">
                          {msg.role === "user" ? "You" : "AI Assistant"}
                        </div>
                        <div className="prose prose-invert max-w-none">
                          {formatMessage(msg.content)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-card border border-border shadow-lg">
                        <div className="text-sm font-medium mb-2 opacity-70">AI Assistant</div>
                        <div className="flex gap-1.5 items-center">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                          <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="border-t border-border/50 p-4 bg-card/80 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Ask me anything about code..."
                    disabled={isLoading}
                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow-primary"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chat;
