import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";

const Review = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = () => {
    setIsReviewing(true);
    // Placeholder for AI review functionality
    setTimeout(() => setIsReviewing(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Code Review
          </h1>
          <p className="text-muted-foreground mb-8">Get AI-powered feedback on your code</p>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Code</CardTitle>
                <CardDescription>Paste your code for review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-[400px] font-mono"
                />
                <Button onClick={handleReview} disabled={!code || isReviewing} className="w-full">
                  {isReviewing ? "Reviewing..." : "Review Code"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Results</CardTitle>
                <CardDescription>AI analysis and suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!code ? (
                  <p className="text-muted-foreground text-center py-8">
                    Submit code to see review results
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Good Practices</p>
                        <p className="text-sm text-muted-foreground">AI review will appear here</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Potential Issues</p>
                        <p className="text-sm text-muted-foreground">Warnings will appear here</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10">
                      <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Suggestions</p>
                        <p className="text-sm text-muted-foreground">Improvements will appear here</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Review;
