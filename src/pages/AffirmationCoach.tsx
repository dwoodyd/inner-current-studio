import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, MessageCircle, CalendarClock, Repeat, BookmarkPlus, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getPaddleEnv } from '@/lib/paddle';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/affirmation-coach`;

const SUGGESTIONS = [
  { icon: Sparkles, label: 'Create affirmations for my self-concept' },
  { icon: MessageCircle, label: 'Explain robotic affirming for my situation' },
  { icon: Repeat, label: 'Give me affirmations for manifesting abundance' },
  { icon: CalendarClock, label: 'Create an hourly affirmation schedule' },
];

const SAVED_KEY = 'innerwake_saved_affirmations';

function getSavedAffirmations(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch { return []; }
}

function saveAffirmation(text: string) {
  const existing = getSavedAffirmations();
  if (!existing.includes(text)) {
    existing.push(text);
    localStorage.setItem(SAVED_KEY, JSON.stringify(existing));
  }
}

function extractAffirmations(content: string): string[] {
  const lines = content.split('\n');
  const affirmations: string[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[\d\-\*•\.]+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/^[""]|[""]$/g, '').trim();
    if (
      cleaned.length > 10 &&
      cleaned.length < 200 &&
      (cleaned.startsWith('I ') || cleaned.startsWith('My ') || cleaned.startsWith('Money ') ||
       cleaned.startsWith('Thank ') || cleaned.startsWith('Everything ') || cleaned.startsWith('Wealth ') ||
       cleaned.startsWith('Abundance ') || cleaned.startsWith('I\'m ') || cleaned.startsWith('People '))
    ) {
      affirmations.push(cleaned.replace(/\.?$/, '.'));
    }
  }
  return affirmations;
}

export default function AffirmationCoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set(getSavedAffirmations()));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSaveAffirmation = useCallback((text: string) => {
    saveAffirmation(text);
    setSavedSet(new Set(getSavedAffirmations()));
    toast('Saved to library ✦', { description: text.slice(0, 60) + '…' });
  }, [toast]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not signed in');

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: allMessages, environment: getPaddleEnv() }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Connection failed' }));
        setMessages(prev => [...prev, { role: 'assistant', content: err.error || 'Something went wrong. Please try again.' }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="relative flex flex-col h-[100dvh] safe-top">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 border-b border-border/20">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate('/money/hub')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} strokeWidth={1.5} /><span className="text-sm">Money Current</span>
          </button>
          <h1 className="font-heading text-lg font-semibold text-foreground">Affirmation Coach</h1>
          <div className="w-[88px]" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="space-y-6 pt-8">
              <div className="text-center space-y-3">
                <motion.div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, hsl(42 65% 58% / 0.15), hsl(160 30% 40% / 0.1))' }}
                  animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity }}>
                  <span className="text-2xl">✦</span>
                </motion.div>
                <h2 className="font-heading text-xl font-semibold text-foreground">How shall we grow today?</h2>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                  Step into the version of you that already has it. How can I guide your affirmation practice?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => send(s.label)}
                    className="soul-glass rounded-xl p-4 text-left space-y-2 hover:bg-muted/10 transition-colors">
                    <s.icon size={18} className="text-soul-gold" />
                    <p className="text-sm text-muted-foreground leading-snug">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => {
            const extracted = m.role === 'assistant' ? extractAffirmations(m.content) : [];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  m.role === 'user'
                    ? 'bg-soul-gold/15 text-foreground'
                    : 'soul-glass text-foreground'
                }`}>
                  {m.role === 'assistant' ? (
                    <>
                      <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed [&_p]:mb-2 [&_ul]:mb-2 [&_li]:text-foreground">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                      {extracted.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/20 space-y-1.5">
                          <p className="text-xs text-muted-foreground font-medium">Save to your library:</p>
                          {extracted.map((aff, j) => {
                            const isSaved = savedSet.has(aff);
                            return (
                              <button key={j} onClick={() => !isSaved && handleSaveAffirmation(aff)}
                                disabled={isSaved}
                                className={`flex items-center gap-2 w-full text-left text-xs rounded-lg px-2.5 py-1.5 transition-colors ${
                                  isSaved ? 'text-soul-gold/60 bg-soul-gold/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                                }`}>
                                {isSaved ? <Check size={12} className="text-soul-gold shrink-0" /> : <BookmarkPlus size={12} className="shrink-0" />}
                                <span className="line-clamp-1">{aff}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="soul-glass rounded-2xl px-4 py-3 flex gap-1">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-soul-gold" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-soul-gold" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-soul-gold" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/20 px-4 py-3 safe-bottom">
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your affirmation coach..."
            rows={1}
            className="flex-1 bg-muted/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-soul-gold/30"
          />
          <button onClick={() => send(input)} disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-soul-gold/20 flex items-center justify-center text-soul-gold hover:bg-soul-gold/30 transition-colors disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
