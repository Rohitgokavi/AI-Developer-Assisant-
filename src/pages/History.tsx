import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Code2, FileText, Trash2, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import { useCodeHistory } from "@/hooks/useCodeHistory";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const History = () => {
  const { history, loading, deleteHistoryItem } = useCodeHistory();
  const navigate = useNavigate();

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
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 ml-64 p-8 transition-all duration-300">
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
      <Navigation />
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            History
          </h1>
          <p className="text-muted-foreground mb-8">Your recent code generations and reviews</p>

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => {
                const Icon = item.type === "generate" ? Code2 : FileText;
                return (
                  <Card key={item.id} className="hover:shadow-glow-primary transition-shadow group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-sidebar">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(item.created_at)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.language}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => deleteHistoryItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
