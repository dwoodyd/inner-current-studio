import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const STORAGE_KEY = "iw_audio_muted";

/**
 * Ambient audio for onboarding. Generates a soft synth pad using Web Audio API
 * — no external assets. A persistent mute toggle is rendered in the corner.
 */
export function AmbientAudio({ active }: { active: boolean }) {
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  }, [muted]);

  useEffect(() => {
    if (!active || muted) {
      stop();
      return;
    }
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, muted]);

  function start() {
    if (ctxRef.current) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
      master.connect(ctx.destination);
      gainRef.current = master;

      // Soft pad: three detuned sines
      const freqs = [110, 165, 220.5]; // A2, E3, A3-ish
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = i === 0 ? "sine" : "triangle";
        o.frequency.value = f;
        // slow LFO on gain for breath
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.08 + i * 0.015;
        lfoGain.gain.value = 0.18;
        lfo.connect(lfoGain).connect(g.gain);
        g.gain.value = 0.3;
        o.connect(g).connect(master);
        o.start();
        lfo.start();
        oscsRef.current.push(o, lfo);
      });
    } catch (e) {
      console.warn("ambient audio failed", e);
    }
  }

  function stop() {
    const ctx = ctxRef.current;
    const master = gainRef.current;
    if (!ctx || !master) return;
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        oscsRef.current.forEach((o) => { try { o.stop(); } catch {} });
        oscsRef.current = [];
        ctx.close();
        ctxRef.current = null;
        gainRef.current = null;
      }, 1100);
    } catch {}
  }

  return (
    <button
      onClick={() => setMuted((m) => !m)}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      className="fixed top-4 right-4 z-50 h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors backdrop-blur-md bg-background/40 border border-border/30"
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}

/** Play a single soft chime (used at reveals). */
export function playChime() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(STORAGE_KEY) === "1") return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1318.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.18, now + 0.02 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.05);
      o.stop(now + 2.6);
    });
    setTimeout(() => ctx.close(), 3000);
  } catch {}
}
