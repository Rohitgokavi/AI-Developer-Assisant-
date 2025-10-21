import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Code2, FileText } from "lucide-react";

const History = () => {
  const historyItems = [
    {
      type: "generate",
      title: "Fibonacci Function",
      language: "Python",
      timestamp: "2 hours ago",
      icon: Code2,
    },
    {
      type: "review",
      title: "React Component Review",
      language: "JavaScript",
      timestamp: "5 hours ago",
      icon: FileText,
    },
    {
      type: "generate",
      title: "Binary Search",
      language: "Java",
      timestamp: "1 day ago",
      icon: Code2,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            History
          </h1>
          <p className="text-muted-foreground mb-8">Your recent code generations and reviews</p>

          <div className="space-y-4">
            {historyItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="hover:shadow-glow-primary transition-shadow cursor-pointer">
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
                            {item.timestamp}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{item.language}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={item.type === "generate" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {item.type}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {historyItems.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No history yet. Start generating or reviewing code!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
