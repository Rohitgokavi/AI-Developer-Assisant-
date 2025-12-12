import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { CodeGenerator } from "@/components/CodeGenerator";
import { CursorSparkle } from "@/components/CursorSparkle";

const Index = () => {
  const [isNavMinimized, setIsNavMinimized] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  const handleRevealContent = () => {
    setShowContent(true);
    setShowNavigation(true);
    setTimeout(() => {
      const element = document.getElementById('code-generator');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCloseContent = () => {
    setShowContent(false);
    setShowNavigation(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CursorSparkle />
      {showNavigation && (
        <Navigation isMinimized={isNavMinimized} onToggle={() => setIsNavMinimized(!isNavMinimized)} />
      )}
      <main className={`flex-1 transition-all duration-300 animate-fade-in ${showNavigation ? (isNavMinimized ? 'ml-16' : 'ml-64') : ''}`}>
        <Hero onStartClick={handleRevealContent} />
        {showContent && (
          <div id="code-generator" className="container py-12 animate-fade-in">
            <CodeGenerator onClose={handleCloseContent} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
