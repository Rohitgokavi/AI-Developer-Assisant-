import { Navigation } from "@/components/Navigation";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Copy, Check, Sparkles, History, LogIn, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useChatHistory, ChatSession } from "@/hooks/useChatHistory";
import { Textarea } from "@/components/ui/textarea";
import AIModeSelector from "@/components/AIModeSelector";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [aiMode, setAiMode] = useState<'developer' | 'tutor' | 'reviewer'>('developer');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isNavMinimized, setIsNavMinimized] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { history, saveSession, loadSession, deleteSession, newSession } = useChatHistory(user);

  // Listen to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setMessages([
          { role: "assistant", content: "👋 Please sign in to start chatting with your AI coding assistant!" }
        ]);
      } else {
        setMessages([
          { role: "assistant", content: "👋 Hello! I'm your AI coding assistant. I can help you with code generation, debugging, and programming questions. How can I assist you today?" }
        ]);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setMessages([
          { role: "assistant", content: "👋 Please sign in to start chatting with your AI coding assistant!" }
        ]);
        newSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleExplainCode(code)}
              >
                <Sparkles className="h-3 w-3" />
                Explain
              </Button>
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

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/chat",
      },
    });

    if (error) {
      toast.error("Failed to sign in");
    }
  };


  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage = { role: "user" as const, content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: updatedMessages, mode: aiMode }),
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

      // Save session after successful response
      const finalMessages = [...updatedMessages, { role: "assistant" as const, content: assistantMessage }];
      await saveSession(finalMessages);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    }

    setIsLoading(false);
  };

  const handleLoadSession = (session: ChatSession) => {
    const loadedMessages = loadSession(session) as Message[];
    setMessages(loadedMessages);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    newSession();
    setMessages([
      { role: "assistant", content: "👋 Hello! I'm your AI coding assistant. How can I help you today?" }
    ]);
  };

  const handleExplainCode = async (code: string) => {
    if (!user) return;
    
    setIsExplaining(true);
    const explainMessage = { role: "user" as const, content: `Please explain this code in detail:\n\`\`\`\n${code}\n\`\`\`` };
    const tempMessages = [...messages, explainMessage];
    setMessages(tempMessages);

    let assistantMessage = "";
    setMessages((prev) => [...prev, { role: "assistant" as const, content: "" }]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: tempMessages, mode: 'tutor' }),
        }
      );

      if (!response.ok || !response.body) {
        toast.error("Failed to explain code");
        setMessages((prev) => prev.slice(0, -2));
        setIsExplaining(false);
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

      const finalMessages = [...tempMessages, { role: "assistant" as const, content: assistantMessage }];
      await saveSession(finalMessages);
    } catch (error) {
      console.error("Error explaining code:", error);
      toast.error("Failed to explain code");
      setMessages((prev) => prev.slice(0, -2));
    }

    setIsExplaining(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation isMinimized={isNavMinimized} onToggle={() => setIsNavMinimized(!isNavMinimized)} />
      <main className={`flex-1 p-8 transition-all duration-300 ${isNavMinimized ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Developer Assistant
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button onClick={handleNewChat} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                  <Button onClick={() => setShowHistory(true)} variant="outline" size="sm">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </>
              ) : (
                <Button onClick={handleSignIn} className="bg-gradient-primary">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in with Google
                </Button>
              )}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              Your intelligent coding companion for generation, debugging, and learning
            </p>
            {user && (
              <AIModeSelector mode={aiMode} setMode={setAiMode} />
            )}
          </div>

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
              <div className="border-t border-border/50 p-4 bg-card/80 backdrop-blur-sm space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder={user ? "Ask me anything about code..." : "Please sign in to chat..."}
                    disabled={isLoading || !user}
                    className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim() || !user}
                    className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow-primary"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>

          {/* History Panel */}
          {showHistory && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col border-border">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <History className="w-6 h-6" />
                      Chat History
                    </h2>
                    <Button onClick={() => setShowHistory(false)} variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    {history.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No chat history yet. Start a conversation to save it!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {history.map((session) => (
                          <div
                            key={session.id}
                            className="border border-border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                            onClick={() => handleLoadSession(session)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{session.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.created_at).toLocaleDateString()} at{" "}
                                  {new Date(session.created_at).toLocaleTimeString()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {session.messages.length} messages
                                </p>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;
