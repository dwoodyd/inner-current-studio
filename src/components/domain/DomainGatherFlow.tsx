import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Play, Pause, ChevronLeft, ChevronRight, Save, Timer, Infinity as InfinityIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DomainConfig } from '@/lib/domains';
import { recordPracticeFor } from '@/lib/currents/progress';

interface Sequence { id: string; title: string; lines: string[]; }

export default function DomainGatherFlow({ domain }: { domain: DomainConfig }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'library' | 'build' | 'play'>('library');
  const [saved, setSaved] = useState<Sequence[]>([]);
  const [title, setTitle] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [newLine, setNewLine] = useState('');
  const [playLines, setPlayLines] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState(true);
  // Duration in minutes; 0 = infinite (loop forever)
  const [durationMin, setDurationMin] = useState<number>(0);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const tickRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('gathered_sequences').select('id,title,lines')
      .eq('user_id', user.id).eq('domain', domain.key).order('created_at', { ascending: false });
    if (data) setSaved(data.map(d => ({ id: d.id, title: d.title, lines: (d.lines as any) ?? [] })));
  };
  useEffect(() => { load(); }, [user, domain.key]);

  useEffect(() => () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    window.speechSynthesis?.cancel();
  }, []);

  // Line advancement loop
  useEffect(() => {
    if (!playing || playLines.length === 0) return;
    tickRef.current = window.setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % playLines.length;
        if (voice) {
          const u = new SpeechSynthesisUtterance(playLines[next]);
          u.rate = 0.9; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
        }
        return next;
      });
    }, 4500);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [playing, playLines, voice]);

  // Countdown for timed meditation sessions
  useEffect(() => {
    if (!playing || durationMin === 0) {
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      return;
    }
    countdownRef.current = window.setInterval(() => {
      setRemainingSec(s => {
        if (s <= 1) {
          setPlaying(false);
          window.speechSynthesis?.cancel();
          toast.success('Meditation complete');
          recordPracticeFor(domain.key);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) window.clearInterval(countdownRef.current); };
  }, [playing, durationMin]);

  const save = async () => {
    if (!user || lines.length === 0) return;
    const { error } = await supabase.from('gathered_sequences').insert({
      user_id: user.id, domain: domain.key,
      title: title || `${domain.label} Sequence`, lines,
      playback_settings: { mode: 'both', speed: 1, voiceEnabled: true },
    });
    if (error) { toast.error('Could not save'); return; }
    toast.success('Sequence saved');
    recordPracticeFor(domain.key);
    setTitle(''); setLines([]); setTab('library'); load();
  };

  const startPlay = (ls: string[]) => {
    setPlayLines(ls); setIdx(0); setPlaying(true); setTab('play');
    setRemainingSec(durationMin > 0 ? durationMin * 60 : 0);
    if (voice && ls[0]) { const u = new SpeechSynthesisUtterance(ls[0]); u.rate = 0.9; window.speechSynthesis.speak(u); }
  };

  const togglePlay = () => {
    setPlaying(p => {
      const next = !p;
      if (!next) window.speechSynthesis?.cancel();
      // If resuming after a timed session ended, restart the timer
      if (next && durationMin > 0 && remainingSec === 0) {
        setRemainingSec(durationMin * 60);
      }
      return next;
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const DURATIONS: { label: string; value: number }[] = [
    { label: '∞', value: 0 },
    { label: '5m', value: 5 },
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '1h', value: 60 },
  ];

  return (
    <div className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-5 safe-top min-h-[100dvh]">
      <button onClick={() => { window.speechSynthesis?.cancel(); navigate(domain.route); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">{domain.label}</span>
      </button>

      <div className="flex bg-muted/20 rounded-full p-1">
        {(['library', 'build', 'play'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-xs capitalize transition ${tab === t ? 'bg-background text-foreground shadow' : 'text-muted-foreground'}`}>{t}</button>
        ))}
      </div>

      {tab === 'library' && (
        <div className="space-y-5">
          {saved.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Your sequences</p>
              {saved.map(s => (
                <button key={s.id} onClick={() => startPlay(s.lines)} className="soul-card w-full text-left p-4 rounded-2xl">
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.lines.length} lines</p>
                </button>
              ))}
            </div>
          )}
          {domain.gatherTiers.map(tier => (
            <div key={tier} className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{tier}</p>
              {(domain.gatherStarters[tier] ?? []).map(line => (
                <button key={line} onClick={() => { setLines(prev => [...prev, line]); setTab('build'); toast('Added to builder'); }}
                  className="soul-card w-full text-left p-3 rounded-xl text-sm text-foreground hover:bg-muted/10 flex items-center justify-between gap-2">
                  <span>{line}</span><Plus size={14} className="text-muted-foreground/50 shrink-0" />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'build' && (
        <div className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sequence title"
            className="w-full soul-card p-4 rounded-2xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="soul-card p-3 rounded-xl flex items-center gap-2">
                <span className={`text-xs font-mono w-5 ${domain.accentClass}`}>{i + 1}</span>
                <span className="flex-1 text-sm text-foreground">{l}</span>
                <button onClick={() => setLines(prev => prev.filter((_, x) => x !== i))} className="text-muted-foreground/40 hover:text-rose-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newLine} onChange={e => setNewLine(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newLine.trim()) { setLines(p => [...p, newLine.trim()]); setNewLine(''); } }}
              placeholder="Add a line…" className="flex-1 soul-card p-3 rounded-xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={() => { if (newLine.trim()) { setLines(p => [...p, newLine.trim()]); setNewLine(''); } }} className="soul-glass-elevated px-4 rounded-xl"><Plus size={16} className={domain.accentClass} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={save} disabled={lines.length === 0} className="soul-glass-elevated py-3 rounded-2xl text-foreground disabled:opacity-40 flex items-center justify-center gap-2">
              <Save size={14} /> Save
            </button>
            <button onClick={() => startPlay(lines)} disabled={lines.length === 0} className="soul-card py-3 rounded-2xl text-foreground disabled:opacity-40 flex items-center justify-center gap-2">
              <Play size={14} /> Play
            </button>
          </div>
        </div>
      )}

      {tab === 'play' && (
        <div className="space-y-6 pt-6 text-center">
          {/* Duration / meditation length picker */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-center gap-1.5">
              <Timer size={11} strokeWidth={1.5} /> Meditation length
            </p>
            <div className="flex bg-muted/20 rounded-full p-1">
              {DURATIONS.map(d => {
                const active = durationMin === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => {
                      setDurationMin(d.value);
                      // Reset countdown if currently playing
                      if (playing) setRemainingSec(d.value > 0 ? d.value * 60 : 0);
                      else setRemainingSec(0);
                    }}
                    className={`flex-1 py-1.5 rounded-full text-xs transition ${active ? 'bg-background text-foreground shadow' : 'text-muted-foreground'}`}
                  >
                    {d.value === 0 ? <InfinityIcon size={14} className="mx-auto" /> : d.label}
                  </button>
                );
              })}
            </div>
            {durationMin > 0 && playing && (
              <p className={`text-xs font-mono ${domain.accentClass}`}>{formatTime(remainingSec)} remaining</p>
            )}
            {durationMin > 0 && !playing && remainingSec > 0 && (
              <p className="text-xs text-muted-foreground font-mono">{formatTime(remainingSec)} paused</p>
            )}
          </div>

          {playLines.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12">Pick a sequence from the library to begin.</p>
          ) : (
            <>
              <div className="min-h-[180px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="font-heading text-2xl text-foreground leading-relaxed px-4">{playLines[idx]}</motion.p>
                </AnimatePresence>
              </div>
              <p className="text-xs text-muted-foreground">{idx + 1} / {playLines.length} · looping</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setIdx(i => (i - 1 + playLines.length) % playLines.length)} className="soul-card p-3 rounded-full"><ChevronLeft size={20} className="text-muted-foreground" /></button>
                <button onClick={togglePlay} className="soul-glass-elevated p-5 rounded-full">
                  {playing ? <Pause size={22} className={domain.accentClass} /> : <Play size={22} className={domain.accentClass} />}
                </button>
                <button onClick={() => setIdx(i => (i + 1) % playLines.length)} className="soul-card p-3 rounded-full"><ChevronRight size={20} className="text-muted-foreground" /></button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
