import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Download } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "rust", label: "Rust" },
];

export const CodeGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("python");
  const [generatedCode, setGeneratedCode] = useState("// Your generated code will appear here...");
  const [displayedCode, setDisplayedCode] = useState("// Your generated code will appear here...");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (generatedCode !== "// Your generated code will appear here..." && isTyping) {
      let i = 0;
      const plainText = generatedCode;
      setDisplayedCode("");

      const type = () => {
        if (i < plainText.length) {
          setDisplayedCode((prev) => prev + plainText[i]);
          i++;
          setTimeout(type, 10);
        } else {
          setIsTyping(false);
        }
      };
      type();
    }
  }, [generatedCode, isTyping]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setIsTyping(false);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, language }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const data = await response.json();
      setGeneratedCode(data.output);
      setIsTyping(true);
      toast({
        title: "Code Generated!",
        description: "Your code is ready to use",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4 animate-slide-up">
          <div className="bg-card p-6 rounded-xl border border-border shadow-lg transition-all duration-300 hover:shadow-glow-primary hover:border-primary/50">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Describe Your Code
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Programming Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Create a function that sorts an array using quicksort algorithm..."
                  className="min-h-[200px] bg-background border-border font-mono text-sm resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 hover:scale-105 text-background font-semibold"
                size="lg"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="bg-card p-6 rounded-xl border border-border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Generated Code</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {isGenerating && (
              <p className="text-primary text-center py-4 animate-pulse">
                🤖 AI is generating your code...
              </p>
            )}
            <div className="rounded-lg overflow-hidden border border-border">
              <Editor
                height="400px"
                language={language}
                value={displayedCode}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  readOnly: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
