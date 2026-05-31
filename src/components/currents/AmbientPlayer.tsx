// AmbientPlayer — small toggle that starts/stops a per-current ambient pad.
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { CurrentAmbient } from '@/lib/currents/ambient';
import type { DomainKey } from '@/lib/domains';

export default function AmbientPlayer({ slug, compact = false }: { slug: DomainKey; compact?: boolean }) {
  const [on, setOn] = useState(false);
  const ref = useRef<CurrentAmbient | null>(null);

  useEffect(() => {
    return () => { ref.current?.stop(); ref.current = null; };
  }, []);

  // stop on slug change
  useEffect(() => {
    return () => { ref.current?.stop(); ref.current = null; setOn(false); };
  }, [slug]);

  async function toggle() {
    if (on) {
      await ref.current?.stop();
      ref.current = null;
      setOn(false);
    } else {
      const a = new CurrentAmbient(slug);
      ref.current = a;
      await a.start();
      setOn(true);
    }
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={on ? 'Mute ambient' : 'Play ambient'}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground"
      >
        {on ? <Volume2 size={14} className="text-primary" /> : <VolumeX size={14} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="soul-glass inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
    >
      {on ? <Volume2 size={12} className="text-primary" /> : <VolumeX size={12} />}
      <span>{on ? 'Ambient on' : 'Ambient'}</span>
    </button>
  );
}
