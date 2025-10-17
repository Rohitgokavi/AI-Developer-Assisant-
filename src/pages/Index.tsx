import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { CodeGenerator } from "@/components/CodeGenerator";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64">
        <Hero />
        <div className="container py-12">
          <CodeGenerator />
        </div>
      </main>
    </div>
  );
};

export default Index;
