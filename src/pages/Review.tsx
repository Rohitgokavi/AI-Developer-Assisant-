import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { useCodeHistory } from "@/hooks/useCodeHistory";
import { useNavigate } from "react-router-dom";

const Review = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("c");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isNavMinimized, setIsNavMinimized] = useState(true);
  const { saveReview } = useCodeHistory();
  const navigate = useNavigate();

  useEffect(() => {
    if (reviewResult && isTyping) {
      let i = 0;
      const plainText = reviewResult;
      setDisplayedText("");

      const type = () => {
        if (i < plainText.length) {
          setDisplayedText((prev) => prev + plainText[i]);
          i++;
          setTimeout(type, 15);
        } else {
          setIsTyping(false);
        }
      };
      type();
    }
  }, [reviewResult, isTyping]);

  const handleReview = async () => {
    if (!code.trim()) return;
    setIsReviewing(true);
    setReviewResult("");
    setDisplayedText("");
    setIsTyping(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ code, language }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to review code');
      }

      const data = await response.json();
      setReviewResult(data.review);
      setIsTyping(true);
      
      // Save to history
      await saveReview(code, language, data.review);
    } catch (error) {
      console.error('Review error:', error);
      setReviewResult('Error reviewing code. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation isMinimized={isNavMinimized} onToggle={() => setIsNavMinimized(!isNavMinimized)} />
      <main className={`flex-1 p-8 transition-all duration-300 ${isNavMinimized ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Code Reviewer
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
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="swift">Swift</SelectItem>
                    <SelectItem value="kotlin">Kotlin</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReview();
                    }
                  }}
                  placeholder="Paste your code here..."
                  className="min-h-[400px] font-mono"
                />
                <p className="text-xs text-muted-foreground">Press Enter to review • Shift + Enter for new line</p>
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
                {isReviewing && (
                  <p className="text-primary text-center py-8 animate-pulse">
                    🧠 Deep AI Review in Progress — Analyzing quality and efficiency...
                  </p>
                )}
                {!reviewResult && !code && !isReviewing ? (
                  <p className="text-muted-foreground text-center py-8">
                    Submit code to see review results
                  </p>
                ) : displayedText ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap text-sm">{displayedText}</pre>
                  </div>
                ) : reviewResult && !isTyping && !isReviewing ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap text-sm">{reviewResult}</pre>
                  </div>
                ) : !isReviewing && !reviewResult && code ? (
                  <p className="text-muted-foreground text-center py-8">
                    Click "Review Code" to get AI feedback
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Review;
