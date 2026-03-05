import { motion } from "framer-motion";

/**
 * FloatingParticles - Animated floating particle effect
 * Creates subtle red particles that drift down the screen
 */
export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            // Softer red
            backgroundColor: `rgba(255, 47, 0, ${0.4 + Math.random() * 0.3})`,

            // Smaller particles (3px – 8px)
            width: `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`,

            // Subtle glow
            boxShadow: "0 0 6px rgba(255, 47, 0, 0.6)",

            left: `${Math.random() * 100}%`,
          }}
          initial={{
            y: "-50px",
            opacity: 0,
          }}
          animate={{
            y: "100vh",
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}