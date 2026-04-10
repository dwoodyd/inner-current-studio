import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppState } from '@/lib/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Msg = { role: 'user' | 'assistant'; content: string };

const AI_CONSENT_KEY = 'innerwake_ai_consent';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/current-guide`;

const STARTERS = [
  "I'm not sure what I'm feeling right now.",
  "I feel stuck but I can't name it.",
  "I want to feel lighter today.",
  "Help me find a calmer thought.",
];

async function streamChat({
  messages,
  emotionalContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  emotionalContext: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) { onError('Not signed in.'); return; }

  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, emotionalContext }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'Something went still. Try again.');
    return;
  }

  if (!resp.body) {
    onError('No response stream.');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial */ }
    }
  }
  onDone();
}

export default function CurrentGuide() {
  const navigate = useNavigate();
  const { state } = useAppState();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasConsented = localStorage.getItem(AI_CONSENT_KEY) === 'true';

  const recentStates = state.checkIns.slice(0, 5).map(c => c.state).join(', ');
  const emotionalContext = recentStates
    ? `Recent check-in states: ${recentStates}`
    : 'No recent check-ins yet.';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    // Check AI consent before first message
    if (!hasConsented && messages.length === 0) {
      setPendingText(text);
      setShowConsent(true);
      return;
    }
    await doSend(text);
  };

  const handleConsentAccepted = () => {
    localStorage.setItem(AI_CONSENT_KEY, 'true');
    setShowConsent(false);
    if (pendingText) {
      doSend(pendingText);
      setPendingText('');
    }
  };

  const doSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        emotionalContext,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (msg) => { toast.error(msg); setIsLoading(false); },
      });
    } catch {
      toast.error('Connection lost. Try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={() => navigate('/profile')} className="text-muted-foreground p-2 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center soul-glow-gold">
            <Sparkles size={14} className="text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-base font-semibold text-foreground">Current Guide</h1>
            <p className="text-[10px] text-muted-foreground">Your inner companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 pt-12 text-center"
          >
            <motion.div
              className="h-16 w-16 rounded-full bg-primary/15 soul-glow-gold flex items-center justify-center"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Sparkles size={24} className="text-primary/70" />
            </motion.div>
            <div className="space-y-2">
              <p className="font-heading text-lg text-foreground">What's present for you?</p>
              <p className="text-xs text-muted-foreground max-w-[16rem]">
                Share what you're feeling. I'll meet you where you are.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {STARTERS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  onClick={() => send(s)}
                  className="text-left text-xs text-muted-foreground border border-border/30 rounded-xl px-4 py-3 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.98]"
                >
                  "{s}"
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/15 text-foreground rounded-br-md'
                    : 'bg-soul-surface text-foreground/90 rounded-bl-md border border-border/20'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 px-2 py-3">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/40"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border/20 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2 items-end">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="Share what's present…"
            className="flex-1 bg-soul-surface rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 border border-border/20"
            disabled={isLoading}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* AI Data Transparency Consent (App Store Guideline 5.1.2(i)) */}
      <AlertDialog open={showConsent} onOpenChange={setShowConsent}>
        <AlertDialogContent className="soul-glass border-border/20 max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-primary" />
              <AlertDialogTitle className="font-heading text-foreground text-base">Before we begin</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed space-y-2">
              <span className="block">Your messages are sent to an AI service to generate responses. Your recent emotional check-in data may also be shared for context.</span>
              <span className="block">Your conversations are not stored on external servers and are not used to train AI models.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/20" onClick={() => { setShowConsent(false); setPendingText(''); }}>
              Not now
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConsentAccepted}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              I understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
