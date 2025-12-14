import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Code2, FileText, Trash2, Sparkles, BookOpen, Lightbulb, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useCodeHistory } from "@/hooks/useCodeHistory";
import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const History = () => {
  const { history, loading, deleteHistoryItem } = useCodeHistory();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNavMinimized, setIsNavMinimized] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const recommendations = [
    {
      title: "Generate a Sorting Algorithm",
      description: "Create an efficient quicksort or mergesort implementation",
      action: () => navigate("/"),
      icon: Sparkles,
    },
    {
      title: "Review Your Code",
      description: "Get AI feedback on code quality and best practices",
      action: () => navigate("/review"),
      icon: BookOpen,
    },
    {
      title: "Chat with AI Assistant",
      description: "Ask coding questions and get instant help",
      action: () => navigate("/chat"),
      icon: Lightbulb,
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        full: format(date, "MMM d, yyyy 'at' h:mm a"),
      };
    } catch {
      return { relative: "Recently", full: "Unknown" };
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation isMinimized={isNavMinimized} onToggle={() => setIsNavMinimized(!isNavMinimized)} />
        <main className={`flex-1 p-8 transition-all duration-300 ${isNavMinimized ? 'ml-16' : 'ml-64'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-48" />
              <div className="h-6 bg-muted rounded w-64" />
              <div className="space-y-4 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation isMinimized={isNavMinimized} onToggle={() => setIsNavMinimized(!isNavMinimized)} />
      <main className={`flex-1 p-8 transition-all duration-300 ${isNavMinimized ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Code History
          </h1>
          <p className="text-muted-foreground mb-8">Your recent code generations and reviews</p>

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => {
                const Icon = item.type === "generate" ? Code2 : FileText;
                const isExpanded = expandedItems.has(item.id);
                const timestamps = formatTimestamp(item.created_at);
                
                return (
                  <Card 
                    key={item.id} 
                    className="hover:shadow-glow-primary transition-shadow group cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-sidebar">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <CardDescription className="flex flex-col gap-1 mt-1">
                              <span className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {timestamps.relative}
                              </span>
                              <span className="text-xs opacity-70">{timestamps.full}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.language}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryItem(item.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={item.type === "generate" ? "default" : "outline"}
                        className="capitalize"
                      >
                        {item.type}
                      </Badge>
                      {item.prompt && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.prompt}
                        </p>
                      )}
                      
                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                          {item.prompt && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold">Prompt</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(item.prompt || "")}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <p className="text-sm bg-muted p-3 rounded-lg">{item.prompt}</p>
                            </div>
                          )}
                          
                          {item.code && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold">Code</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(item.code || "")}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <ScrollArea className="h-[200px] w-full rounded-lg border">
                                <pre className="text-sm bg-muted p-3 font-mono whitespace-pre-wrap">{item.code}</pre>
                              </ScrollArea>
                            </div>
                          )}
                          
                          {item.result && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold">Result</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(item.result || "")}
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy
                                </Button>
                              </div>
                              <ScrollArea className="h-[300px] w-full rounded-lg border">
                                <pre className="text-sm bg-muted p-3 font-mono whitespace-pre-wrap">{item.result}</pre>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <Code2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No history yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start generating or reviewing code to see your activity here!
                  </p>
                </CardContent>
              </Card>

              <h2 className="text-2xl font-bold mt-8 mb-4">Get Started</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {recommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <Card
                      key={idx}
                      className="cursor-pointer hover:shadow-glow-primary transition-all hover:scale-105"
                      onClick={rec.action}
                    >
                      <CardHeader>
                        <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;