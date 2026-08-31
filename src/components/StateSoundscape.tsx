import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { STATE_DEFS } from '@/lib/states';
import { SOUND_OPTIONS, startSound, stopSound, setVolume } from '@/lib/sounds';
import type { QuickState } from '@/lib/types';

interface Props {
  state: QuickState;
}

/**
 * Wave A audio UI — a small, calm soundscape control bound to the
 * user's current state. Audio only starts on explicit tap (browser policy).
 * When the user changes state, the soundscape crossfades by stopping
 * the previous track and starting the new one at the same volume.
 */
export default function StateSoundscape({ state }: Props) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVol] = useState(0.4);
  const lastStateRef = useRef<QuickState>(state);

  const def = STATE_DEFS[state];
  const sound = SOUND_OPTIONS.find(s => s.id === def.soundscape);

  // Restart sound when state changes while playing
  useEffect(() => {
    if (playing && lastStateRef.current !== state) {
      startSound(def.soundscape, volume);
    }
    lastStateRef.current = state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Stop on unmount
  useEffect(() => () => { stopSound(); }, []);

  const toggle = () => {
    if (playing) {
      stopSound();
      setPlaying(false);
    } else {
      startSound(def.soundscape, volume);
      setPlaying(true);
    }
  };

  const onVolume = (v: number) => {
    setVol(v);
    if (playing) setVolume(v);
  };

  return (
    <div className="soul-glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 ${
            playing ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border/30 bg-muted/30 text-muted-foreground'
          }`}
          aria-label={playing ? 'Pause soundscape' : 'Play soundscape'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
          {playing && (
            <motion.span
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {sound?.name ?? 'Soundscape'}
            </p>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 shrink-0">
              {def.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground/70 italic truncate">
            Matched to your current state.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 flex items-center gap-3">
              <VolumeX size={12} className="text-muted-foreground/40" />
              <input
                type="range"
                aria-label="Soundscape volume"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={e => onVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-muted/30 rounded-full appearance-none cursor-pointer accent-primary"
                aria-label="Volume"
              />
              <Volume2 size={12} className="text-muted-foreground/40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
