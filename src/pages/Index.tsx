import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { CodeGenerator } from "@/components/CodeGenerator";
import { CursorSparkle } from "@/components/CursorSparkle";

const Index = () => {
  const [isNavMinimized, setIsNavMinimized] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleRevealContent = () => {
    setShowContent(true);
    setTimeout(() => {
      const element = document.getElementById('code-generator');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CursorSparkle />
      <Navigation isMinimized={isNavMinimized} onToggle={() => setIsNavMinimized(!isNavMinimized)} />
      <main className={`flex-1 transition-all duration-300 animate-fade-in ${isNavMinimized ? 'ml-16' : 'ml-64'}`}>
        <Hero onStartClick={handleRevealContent} />
        {showContent && (
          <div id="code-generator" className="container py-12 animate-fade-in">
            <CodeGenerator />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
