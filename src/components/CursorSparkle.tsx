import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CursorSparkle = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {isVisible && (
        <>
          {/* Outer glow ring */}
          <motion.div
            className="absolute w-10 h-10 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 blur-md"
            style={{
              left: mousePos.x - 20,
              top: mousePos.y - 20,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute w-6 h-6 rounded-full border-2 border-primary/60 bg-primary/10"
            style={{
              left: mousePos.x - 12,
              top: mousePos.y - 12,
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.3, 0.6],
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
