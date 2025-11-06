import React from "react";
import { motion } from "framer-motion";

interface AIModeSelectorProps {
  mode: 'developer' | 'tutor' | 'reviewer';
  setMode: (mode: 'developer' | 'tutor' | 'reviewer') => void;
}

export default function AIModeSelector({ mode, setMode }: AIModeSelectorProps) {
  const modes = [
    {
      id: "developer" as const,
      title: "👨‍💻 Developer Mode",
      desc: "Generates clean, optimized, and production-ready code.",
      colorClass: "border-primary bg-primary/10",
      activeColorClass: "border-primary bg-primary/20 text-primary",
      textColor: "text-primary"
    },
    {
      id: "tutor" as const,
      title: "🎓 Tutor Mode",
      desc: "Explains coding concepts step-by-step in simple terms.",
      colorClass: "border-secondary bg-secondary/10",
      activeColorClass: "border-secondary bg-secondary/20 text-secondary",
      textColor: "text-secondary"
    },
    {
      id: "reviewer" as const,
      title: "🧩 Reviewer Mode",
      desc: "Analyzes your code for bugs, structure, and performance.",
      colorClass: "border-accent bg-accent/10",
      activeColorClass: "border-accent bg-accent/20 text-accent",
      textColor: "text-accent"
    },
  ];

  const activeMode = modes.find((m) => m.id === mode)!;

  return (
    <div className="flex flex-col items-center w-full mb-6">
      {/* Top Banner */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full text-center py-2 mb-4 rounded-lg border text-sm font-semibold ${activeMode.activeColorClass}`}
      >
        Active Mode: {activeMode.title}
      </motion.div>

      {/* Animated Mode Toggle */}
      <div className="relative flex justify-around bg-card border border-border p-2 rounded-2xl w-full max-w-md mb-6">
        <motion.div
          layout
          className="absolute top-2 bottom-2 rounded-xl"
          animate={{
            left: mode === "developer" ? "3%" : mode === "tutor" ? "35%" : "68%",
            backgroundColor: mode === "developer" 
              ? "hsl(var(--primary) / 0.2)" 
              : mode === "tutor"
              ? "hsl(var(--secondary) / 0.2)"
              : "hsl(var(--accent) / 0.2)",
            width: "29%",
          }}
          transition={{ duration: 0.3 }}
        />
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`relative z-10 px-3 py-1 text-sm font-semibold transition-colors duration-300 ${
              m.id === mode ? m.textColor : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.title.split(" ")[0]} {m.title.split(" ").slice(1, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {modes.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setMode(m.id)}
            className={`cursor-pointer p-4 text-center rounded-2xl border transition-all ${
              mode === m.id
                ? m.activeColorClass
                : "border-border bg-card/60 hover:bg-card"
            }`}
          >
            <h3
              className={`text-lg font-bold ${
                mode === m.id ? m.textColor : "text-foreground"
              }`}
            >
              {m.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">{m.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
