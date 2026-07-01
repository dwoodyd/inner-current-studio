import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Feather, Library, Loader2, Plus, Save, Sparkles, Square, Trash2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getPaddleEnv } from '@/lib/paddle';
import { useAuth } from '@/hooks/useAuth';
import { DomainConfig } from '@/lib/domains';
import ConstellationProgress from './ConstellationProgress';

type Mode = 'guided' | 'free' | 'blueprint';
type View = 'hub' | 'new' | 'library' | 'detail';

interface ScriptRow {
  id: string;
  domain: string;
  mode: Mode;
  title: string;
  prompt: string;
  content: string;
  feeling_word: string;
  sensory_details: Record<string, string>;
  status: string;
  created_at: string;
}

interface ProgressRow {
  tier: string;
  current_streak: number;
  script_count: number;
  evidence_count: number;
  constellation_progress: number;
}

const modes: { key: Mode; label: string; description: string; icon: typeof Feather }[] = [
  { key: 'guided', label: 'Daily scene', description: 'A short prompt for scripting one lived moment.', icon: Sparkles },
  { key: 'free', label: 'Open script', description: 'Write your reality in your own rhythm.', icon: Feather },
  { key: 'blueprint', label: 'Reality blueprint', description: 'Shape the scene, senses, evidence, and identity.', icon: BookOpen },
];

const prompts: Record<string, string[]> = {
  self: ['Script a moment where you move through the day fully at home in yourself.', 'Write from the version of you who no longer needs to prove anything.'],
  energy: ['Script a day where your body feels restored, responsive, and alive.', 'Write the scene where vitality returns naturally and gently.'],
  relationships: ['Script a moment where connection feels safe, mutual, and easy.', 'Write from the reality where love can come close and stay soft.'],
  health: ['Script a scene where your body feels trusted, supported, and cared for.', 'Write from the version of you who listens to your body with love.'],
  money: ['Script a moment where money feels calm, clean, and supportive.', 'Write from the reality where receiving feels normal and safe.'],
};

const tiers = ['Dreamer', 'Weaver', 'Architect', 'Oracle', 'Sovereign'];
const MAX_TTS_CHARS = 2200;

function prepareAudioText(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= MAX_TTS_CHARS) return normalized;

  const boundary = normalized.lastIndexOf('.', MAX_TTS_CHARS);
  return normalized.slice(0, boundary > 900 ? boundary + 1 : MAX_TTS_CHARS).trim();
}

function tierFor(scripts: number, evidence: number) {
  return tiers[Math.min(tiers.length - 1, Math.floor((scripts + evidence) / 5))];
}

function coachNudges(content: string) {
  const nudges = [];
  if (!/\bI am\b|\bI have\b|\bI feel\b/i.test(content)) nudges.push('Bring one sentence into the present tense: “I am…”');
  if (!/see|hear|feel|touch|warm|light|breath|body/i.test(content)) nudges.push('Add one sensory detail so the scene has a body.');
  if (content.length > 80 && !/grateful|safe|easy|proud|relieved|free|loved|alive/i.test(content)) nudges.push('Name the emotional tone this reality carries.');
  return nudges.slice(0, 2);
}

export default function RealityScripting({ domain, view }: { domain: DomainConfig; view: View }) {
  const navigate = useNavigate();
  const { scriptId } = useParams();
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ScriptRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow>({ tier: 'Dreamer', current_streak: 0, script_count: 0, evidence_count: 0, constellation_progress: 0 });
  const [mode, setMode] = useState<Mode>('guided');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [feeling, setFeeling] = useState('');
  const [evidence, setEvidence] = useState('');
  const [saving, setSaving] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlsRef = useRef<Map<string, string>>(new Map());

  const prompt = useMemo(() => prompts[domain.key]?.[new Date().getDate() % 2] ?? prompts.self[0], [domain.key]);
  const selected = scripts.find(s => s.id === scriptId);
  const nudges = coachNudges(content || selected?.content || '');

  const load = async () => {
    if (!user) return;
    const client = supabase as any;
    const [{ data: scriptData }, { data: progressData }] = await Promise.all([
      client.from('reality_scripts').select('id, domain, title, content, prompt, feeling_word, sensory_details, mode, status, revisit_at, created_at, updated_at').eq('user_id', user.id).eq('domain', domain.key).order('created_at', { ascending: false }),
      client.from('reality_progress').select('id, domain, tier, current_streak, longest_streak, script_count, evidence_count, constellation_progress, last_scripted_at, created_at, updated_at').eq('user_id', user.id).eq('domain', domain.key).maybeSingle(),
    ]);
    setScripts((scriptData ?? []) as ScriptRow[]);
    if (progressData) setProgress(progressData as ProgressRow);
  };

  useEffect(() => { load(); }, [user, domain.key]);

  useEffect(() => () => {
    audioRef.current?.pause();
    audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    audioUrlsRef.current.clear();
  }, []);

  const upsertProgress = async (nextScriptCount: number, nextEvidenceCount = progress.evidence_count) => {
    if (!user) return;
    const constellation = Math.min(100, (nextScriptCount * 12) + (nextEvidenceCount * 8));
    await (supabase as any).from('reality_progress').upsert({
      user_id: user.id,
      domain: domain.key,
      tier: tierFor(nextScriptCount, nextEvidenceCount),
      current_streak: Math.max(1, progress.current_streak || 0),
      longest_streak: Math.max(1, progress.current_streak || 0),
      script_count: nextScriptCount,
      evidence_count: nextEvidenceCount,
      constellation_progress: constellation,
      last_scripted_at: new Date().toISOString(),
    }, { onConflict: 'user_id,domain' });
  };

  const saveScript = async () => {
    if (!user || !content.trim()) return;
    setSaving(true);
    const client = supabase as any;
    const { error } = await client.from('reality_scripts').insert({
      user_id: user.id,
      domain: domain.key,
      mode,
      title: title.trim() || `${domain.label.replace(' Current', '')} script`,
      prompt: mode === 'guided' ? prompt : '',
      content: content.trim(),
      feeling_word: feeling.trim(),
      sensory_details: {},
      status: 'complete',
      revisit_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    });
    if (!error) await upsertProgress(progress.script_count + 1);
    setSaving(false);
    if (error) { toast.error('Could not save your script'); return; }
    toast.success('Script crystallized');
    navigate(`${domain.route}/script/library`);
  };

  const addEvidence = async () => {
    if (!user || !selected || !evidence.trim()) return;
    const { error } = await (supabase as any).from('reality_evidence').insert({
      user_id: user.id,
      script_id: selected.id,
      domain: domain.key,
      entry_text: evidence.trim(),
      match_strength: 3,
      felt_like_match: true,
    });
    if (!error) await upsertProgress(progress.script_count, progress.evidence_count + 1);
    if (error) { toast.error('Could not save evidence'); return; }
    setEvidence('');
    toast.success('Evidence added to the constellation');
    load();
  };

  const removeScript = async (id: string) => {
    await (supabase as any).from('reality_scripts').delete().eq('id', id);
    load();
  };

  const playScriptAudio = async (script: ScriptRow) => {
    if (audioPlaying && audioRef.current?.dataset.scriptId === script.id) {
      audioRef.current.pause();
      setAudioPlaying(false);
      return;
    }

    audioRef.current?.pause();

    const cachedUrl = audioUrlsRef.current.get(script.id);
    if (cachedUrl) {
      const audio = new Audio(cachedUrl);
      audio.dataset.scriptId = script.id;
      audioRef.current = audio;
      audio.onended = () => setAudioPlaying(false);
      await audio.play();
      setAudioPlaying(true);
      return;
    }

    setAudioLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Sign in again to play audio.');
      const audioText = prepareAudioText(script.content);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/script-tts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: script.title, text: audioText, environment: getPaddleEnv() }),
      });
      if (!response.ok) throw new Error(await response.text());
      const url = URL.createObjectURL(await response.blob());
      audioUrlsRef.current.set(script.id, url);
      const audio = new Audio(url);
      audio.dataset.scriptId = script.id;
      audioRef.current = audio;
      audio.onended = () => setAudioPlaying(false);
      await audio.play();
      setAudioPlaying(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not play script audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const Back = () => (
    <button onClick={() => navigate(domain.route)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">{domain.label}</span>
    </button>
  );

  if (view === 'new') {
    return (
      <main className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <Back />
        <section className="text-center space-y-2">
          <h1 className="font-heading text-3xl text-foreground">Script your current</h1>
          <p className="text-sm text-muted-foreground">Write it as lived reality, not distant wanting.</p>
        </section>
        <div className="grid grid-cols-3 gap-2">
          {modes.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setMode(key)} className={`soul-chip px-2 py-3 rounded-2xl text-xs ${mode === key ? 'soul-chip-active' : 'soul-chip-idle'}`}>
              <Icon size={16} className="mx-auto mb-1" />{label}
            </button>
          ))}
        </div>
        {mode === 'guided' && <div className="soul-glass-elevated rounded-2xl p-4 text-sm leading-relaxed text-foreground">{prompt}</div>}
        {mode === 'blueprint' && (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {['Scene', 'Feeling', 'Identity', 'Evidence'].map(item => <div key={item} className="rounded-xl bg-muted/30 p-3">{item}</div>)}
          </div>
        )}
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name this reality" className="w-full rounded-2xl border border-border/20 bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="I am here now. I can feel..." className="min-h-[220px] w-full rounded-2xl border border-border/20 bg-card/40 px-4 py-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
        <input value={feeling} onChange={e => setFeeling(e.target.value)} placeholder="One feeling word" className="w-full rounded-2xl border border-border/20 bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        {nudges.length > 0 && <div className="space-y-2">{nudges.map(n => <p key={n} className="text-xs text-primary/80 bg-primary/10 rounded-xl px-3 py-2">{n}</p>)}</div>}
        <button onClick={saveScript} disabled={saving || !content.trim()} className="soul-btn-primary w-full flex items-center justify-center gap-2 rounded-2xl disabled:opacity-40"><Save size={16} /> Crystallize script</button>
      </main>
    );
  }

  if (view === 'library') {
    return (
      <main className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <Back />
        <section className="text-center space-y-2"><h1 className="font-heading text-3xl text-foreground">Script library</h1><p className="text-sm text-muted-foreground">Revisit what you are rehearsing into form.</p></section>
        <button onClick={() => navigate(`${domain.route}/script/new`)} className="soul-btn-primary w-full flex items-center justify-center gap-2 rounded-2xl"><Plus size={16} /> New script</button>
        <div className="space-y-3">
          {scripts.length === 0 && <p className="text-center text-sm text-muted-foreground/70 py-10">Your first scripted reality is waiting.</p>}
          {scripts.map((script, i) => (
            <motion.article key={script.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="soul-card rounded-2xl p-4 flex gap-3">
              <button onClick={() => navigate(`${domain.route}/script/${script.id}`)} className="flex-1 text-left space-y-1">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{script.mode}</p>
                <h2 className="font-heading text-xl text-foreground">{script.title}</h2>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{script.content}</p>
              </button>
              <button onClick={() => removeScript(script.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors"><Trash2 size={15} /></button>
            </motion.article>
          ))}
        </div>
      </main>
    );
  }

  if (view === 'detail') {
    return (
      <main className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
        <button onClick={() => navigate(`${domain.route}/script/library`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><ArrowLeft size={18} /><span className="text-sm">Library</span></button>
        {!selected ? <p className="text-center text-sm text-muted-foreground py-10">Script not found.</p> : <>
          <section className="space-y-2"><p className="text-xs uppercase tracking-[0.18em] text-primary/80">{selected.mode}</p><h1 className="font-heading text-3xl text-foreground">{selected.title}</h1></section>
          <article className="soul-glass-elevated rounded-2xl p-5 text-sm leading-7 text-foreground whitespace-pre-wrap">{selected.content}</article>
          <button onClick={() => playScriptAudio(selected)} disabled={audioLoading} className="soul-btn-primary w-full flex items-center justify-center gap-2 rounded-2xl disabled:opacity-50">
            {audioLoading ? <Loader2 size={16} className="animate-spin" /> : audioPlaying ? <Square size={16} /> : <Volume2 size={16} />}
            {audioLoading ? 'Preparing audio' : audioPlaying ? 'Stop audio' : 'Listen to script'}
          </button>
          {selected.feeling_word && <p className="text-sm text-muted-foreground">Feeling tone: <span className="text-primary">{selected.feeling_word}</span></p>}
          <div className="soul-card rounded-2xl p-4 space-y-3">
            <h2 className="font-heading text-xl text-foreground">Mark matching evidence</h2>
            <textarea value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="What showed up in real life?" className="min-h-[90px] w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none" />
            <button onClick={addEvidence} disabled={!evidence.trim()} className="soul-btn-primary w-full rounded-2xl disabled:opacity-40">Add evidence</button>
          </div>
        </>}
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-lg px-4 pt-12 pb-8 space-y-6 safe-top">
      <Back />
      <section className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: domain.gradient }}><span className="text-2xl">✍️</span></div>
        <h1 className="font-heading text-3xl text-foreground">Reality Scripting</h1>
        <p className="mx-auto max-w-[310px] text-sm leading-relaxed text-muted-foreground">Daily scenes, open scripts, and blueprints for the {domain.label.toLowerCase()} you are becoming.</p>
      </section>
      <ConstellationProgress progress={progress.constellation_progress} tier={progress.tier} scripts={progress.script_count} evidence={progress.evidence_count} />
      <div className="space-y-3">
        {[{ title: 'Begin a script', description: 'Guided, free-form, or blueprint.', to: 'new', icon: Plus }, { title: 'Script library', description: 'Re-read, re-feel, and add evidence.', to: 'library', icon: Library }].map(({ title, description, to, icon: Icon }) => (
          <button key={title} onClick={() => navigate(`${domain.route}/script/${to}`)} className="soul-glass-elevated w-full rounded-2xl p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-all">
            <div className="h-11 w-11 rounded-xl bg-muted/30 flex items-center justify-center"><Icon size={19} className={domain.accentClass} /></div>
            <div className="flex-1"><h2 className="font-heading text-lg text-foreground">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>
            <ChevronRight size={16} className="text-muted-foreground/40" />
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {modes.map(({ key, label, description }) => <div key={key} className="rounded-2xl bg-muted/20 p-3"><p className="text-xs text-primary/80">{label}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p></div>)}
      </div>
    </main>
  );
}
