import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
}

export const CursorSparkle = () => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let sparkleId = 0;
    let lastSparkle = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const now = Date.now();
      if (now - lastSparkle > 50) {
        lastSparkle = now;
        const newSparkle: Sparkle = {
          id: sparkleId++,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
        };
        
        setSparkles((prev) => [...prev.slice(-8), newSparkle]);
        
        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
        }, 600);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              boxShadow: "0 0 6px hsl(var(--primary) / 0.5)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
