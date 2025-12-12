import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailDot {
  id: number;
  x: number;
  y: number;
}

export const CursorSparkle = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const trailIdRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Add new trail dot
      const newDot: TrailDot = {
        id: trailIdRef.current++,
        x: e.clientX,
        y: e.clientY,
      };
      
      setTrail((prev) => [...prev.slice(-12), newDot]);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setTrail([]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Clean up old trail dots
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail((prev) => prev.slice(1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Trail dots */}
      <AnimatePresence>
        {trail.map((dot, index) => {
          const opacity = (index + 1) / trail.length;
          const scale = 0.3 + (index / trail.length) * 0.7;
          return (
            <motion.div
              key={dot.id}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: opacity * 0.6, scale }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"
              style={{
                left: dot.x - 6,
                top: dot.y - 6,
              }}
            />
          );
        })}
      </AnimatePresence>

      {isVisible && (
        <>
          {/* Outer glow ring */}
          <motion.div
            className="absolute w-10 h-10 rounded-full bg-gradient-to-r from-primary/40 to-secondary/40 blur-md"
            style={{
              left: mousePos.x - 20,
              top: mousePos.y - 20,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute w-6 h-6 rounded-full border-2 border-primary/70 bg-gradient-to-r from-primary/20 to-secondary/20"
            style={{
              left: mousePos.x - 12,
              top: mousePos.y - 12,
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.7, 0.4, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
    </div>
  );
};
