import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Play, Pause, ChevronLeft, ChevronRight, Save, Timer, Infinity as InfinityIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { DomainConfig } from '@/lib/domains';

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

  useEffect(() => () => { if (tickRef.current) window.clearInterval(tickRef.current); window.speechSynthesis?.cancel(); }, []);

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

  const save = async () => {
    if (!user || lines.length === 0) return;
    const { error } = await supabase.from('gathered_sequences').insert({
      user_id: user.id, domain: domain.key,
      title: title || `${domain.label} Sequence`, lines,
      playback_settings: { mode: 'both', speed: 1, voiceEnabled: true },
    });
    if (error) { toast.error('Could not save'); return; }
    toast.success('Sequence saved');
    setTitle(''); setLines([]); setTab('library'); load();
  };

  const startPlay = (ls: string[]) => { setPlayLines(ls); setIdx(0); setPlaying(true); setTab('play');
    if (voice && ls[0]) { const u = new SpeechSynthesisUtterance(ls[0]); u.rate = 0.9; window.speechSynthesis.speak(u); }
  };

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
        <div className="space-y-8 pt-6 text-center">
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
              <p className="text-xs text-muted-foreground">{idx + 1} / {playLines.length}</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setIdx(i => (i - 1 + playLines.length) % playLines.length)} className="soul-card p-3 rounded-full"><ChevronLeft size={20} className="text-muted-foreground" /></button>
                <button onClick={() => setPlaying(p => !p)} className="soul-glass-elevated p-5 rounded-full">
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
