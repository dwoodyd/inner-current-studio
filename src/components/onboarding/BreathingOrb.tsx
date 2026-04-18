import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface BreathingOrbProps {
  size?: number;
  hue?: number; // 0-360, gold default
  intensity?: number; // 0-1
  paused?: boolean;
}

/**
 * A slow, hypnotic breathing orb. 4s inhale, 4s exhale, infinite loop.
 * Uses framer-motion for the breath, plus a soft inner glow.
 */
export function BreathingOrb({
  size = 220,
  hue = 42,
  intensity = 1,
  paused = false,
}: BreathingOrbProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (paused) {
      controls.stop();
      return;
    }
    controls.start({
      scale: [1, 1.18, 1],
      opacity: [0.85, 1, 0.85],
      transition: { duration: 8, ease: [0.45, 0, 0.55, 1], repeat: Infinity },
    });
  }, [paused, controls]);

  const inner = `radial-gradient(circle at 38% 32%, hsl(${hue} 75% 70% / ${0.55 * intensity}), hsl(${hue} 65% 50% / ${0.18 * intensity}) 45%, hsl(${hue} 60% 35% / 0) 72%)`;
  const halo = `radial-gradient(circle at 50% 50%, hsl(${hue} 80% 60% / ${0.18 * intensity}), transparent 65%)`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* outer halo */}
      <motion.div
        className="absolute inset-[-30%] rounded-full pointer-events-none"
        style={{ background: halo, filter: "blur(20px)" }}
        animate={paused ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, ease: [0.45, 0, 0.55, 1], repeat: Infinity }}
      />
      {/* core orb */}
      <motion.div
        className="rounded-full"
        animate={controls}
        style={{
          width: size,
          height: size,
          background: inner,
          boxShadow: `0 0 60px hsl(${hue} 70% 55% / ${0.25 * intensity}), inset 0 0 40px hsl(${hue} 80% 70% / ${0.3 * intensity})`,
        }}
      />
      {/* highlight */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 0.35,
          height: size * 0.35,
          top: size * 0.18,
          left: size * 0.22,
          background: `radial-gradient(circle, hsl(${hue} 100% 92% / 0.5), transparent 70%)`,
          filter: "blur(8px)",
        }}
        animate={paused ? undefined : { opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}
