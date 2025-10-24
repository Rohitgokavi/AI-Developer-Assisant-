import { Code2, Sparkles, History, MessageSquare, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { icon: Code2, label: "Code Generator", path: "/" },
  { icon: Sparkles, label: "Code Review", path: "/review" },
  { icon: MessageSquare, label: "AI Assistant", path: "/chat" },
  { icon: History, label: "History", path: "/history" },
  { icon: LogIn, label: "Login", path: "/auth" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border p-4 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-mono">
              AI Dev Assistant
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Powered by AI</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-105 animate-fade-in",
                isActive
                  ? "bg-sidebar-accent text-primary shadow-glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="w-5 h-5 transition-transform duration-300" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Built with Lovable
        </p>
      </div>
    </nav>
  );
};
