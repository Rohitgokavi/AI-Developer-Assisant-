import { motion } from "framer-motion";

interface AIModeSelectorProps {
  mode: 'developer' | 'tutor' | 'reviewer';
  setMode: (mode: 'developer' | 'tutor' | 'reviewer') => void;
}

export default function AIModeSelector({ mode, setMode }: AIModeSelectorProps) {
  const modes = [
    { id: "developer" as const, label: "👨‍💻 Developer" },
    { id: "tutor" as const, label: "🎓 Tutor" },
    { id: "reviewer" as const, label: "🧩 Reviewer" },
  ];

  return (
    <div className="relative flex bg-card border border-border p-1 rounded-xl w-full max-w-sm">
      <motion.div
        layout
        className="absolute top-1 bottom-1 rounded-lg bg-primary/20"
        animate={{
          left: mode === "developer" ? "2px" : mode === "tutor" ? "33.33%" : "66.66%",
          width: "32%",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`relative z-10 flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
            m.id === mode ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
