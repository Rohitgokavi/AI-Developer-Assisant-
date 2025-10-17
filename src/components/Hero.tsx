import { Button } from "@/components/ui/button";
import { Sparkles, Code, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-card rounded-2xl shadow-glow-primary">
            <Code className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 font-mono">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            AI Developer Assistant
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up">
          Generate, review, and optimize code with the power of AI. 
          <br />
          Your intelligent coding companion.
        </p>

        <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button size="lg" className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 text-background font-semibold">
            <Sparkles className="w-5 h-5 mr-2" />
            Start Generating
          </Button>
          <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:shadow-glow-primary transition-all duration-300">
            <Zap className="w-5 h-5 mr-2" />
            Learn More
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { icon: Code, title: "Smart Generation", desc: "Convert ideas to code instantly" },
            { icon: Sparkles, title: "Code Review", desc: "AI-powered analysis & optimization" },
            { icon: Zap, title: "Lightning Fast", desc: "Get results in seconds" },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary animate-slide-up"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <feature.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
