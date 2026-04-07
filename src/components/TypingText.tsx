import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypingText({ text, speed = 30, delay = 0, className = '', onComplete }: TypingTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setStarted(false);
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [started, displayed, text, speed, onComplete]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {displayed}
      {started && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-primary"
        >
          |
        </motion.span>
      )}
    </motion.span>
  );
}
