import { Code2, Sparkles, History, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountSection } from "@/components/AccountSection";

const navItems = [
  { icon: Code2, label: "Code Generator", path: "/" },
  { icon: Sparkles, label: "Code Review", path: "/review" },
  { icon: MessageSquare, label: "AI Assistant", path: "/chat" },
  { icon: History, label: "History", path: "/history" },
];

interface NavigationProps {
  isMinimized?: boolean;
  onToggle?: () => void;
  hideToggle?: boolean;
}

export const Navigation = ({ isMinimized = false, onToggle, hideToggle = false }: NavigationProps) => {
  const location = useLocation();

  return (
    <nav className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar/80 backdrop-blur-sm border-r border-sidebar-border p-4 flex flex-col transition-all duration-300 z-40",
      isMinimized ? "w-16" : "w-64"
    )}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {!isMinimized && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent font-mono">
                AI Dev
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Powered by AI</p>
            </div>
          )}
          <div className="flex items-center gap-1">
            {!isMinimized && <ThemeToggle />}
            {onToggle && !hideToggle && (
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                {isMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>
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
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300",
                isMinimized ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-accent text-primary shadow-glow-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={isMinimized ? item.label : undefined}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 flex-shrink-0" />
              {!isMinimized && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <AccountSection isMinimized={isMinimized} />
    </nav>
  );
};
