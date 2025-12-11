import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { CodeGenerator } from "@/components/CodeGenerator";
import { CursorSparkle } from "@/components/CursorSparkle";

const Index = () => {
  const [isNavMinimized, setIsNavMinimized] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      <CursorSparkle />
      <Navigation isMinimized={isNavMinimized} onToggle={() => setIsNavMinimized(!isNavMinimized)} />
      <main className={`flex-1 transition-all duration-300 animate-fade-in ${isNavMinimized ? 'ml-16' : 'ml-64'}`}>
        <Hero />
        <div id="code-generator" className="container py-12">
          <CodeGenerator />
        </div>
      </main>
    </div>
  );
};

export default Index;
