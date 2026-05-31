import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFounderSlots } from '@/hooks/useFounderSlots';
import { toast } from 'sonner';
import innerWakeIcon from '@/assets/inner-wake-logo.svg';

const FOCUS_OPTIONS = ['Self', 'Money', 'Energy', 'Relationships', 'Health'] as const;

export default function FoundingMember() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { remaining: slotsRemaining, loading: slotsLoading } = useFounderSlots();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    name: '',
    current_focus: '' as (typeof FOCUS_OPTIONS)[number] | '',
    why: '',
    practice_context: '',
  });

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((f) => ({ ...f, email: user.email ?? '' }));
    }
  }, [user, form.email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.why || form.why.trim().length < 20) {
      toast.error('Tell us a little more — at least a few sentences in "Why now."');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('founding_member_applications').insert({
        user_id: user?.id ?? null,
        email: form.email.trim(),
        name: form.name.trim(),
        current_focus: form.current_focus || null,
        why: form.why.trim(),
        practice_context: form.practice_context.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not submit. Try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground safe-x safe-top">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-5 pb-16 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <img src={innerWakeIcon} alt="Inner Wake" className="h-16 w-16 object-contain" />
          <p className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-primary/80">
            <Sparkles size={12} /> Founding 100
          </p>
          <h1 className="mt-3 font-heading text-3xl font-light leading-tight sm:text-4xl">
            Join the first circle.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            One hundred lifetime memberships at the founding rate. We read every application by hand.
            Your story shapes how Inner Wake grows.
          </p>
          {!slotsLoading && typeof slotsRemaining === 'number' && (
            <p className="mt-4 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-primary">
              {slotsRemaining} of 100 spots remaining
            </p>
          )}
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-primary/20 bg-card/60 p-6 text-center backdrop-blur"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check />
            </div>
            <h2 className="font-heading text-xl">We received your note.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We'll be in touch at <span className="text-foreground">{form.email}</span> within a few days.
              In the meantime, your trial is open — wander, breathe, see what resonates.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Return home
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <Field label="Your name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="iw-input"
                placeholder="What we should call you"
                required
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="iw-input"
                placeholder="you@example.com"
                required
              />
            </Field>

            <Field label="Current focus" hint="Which area is most alive for you right now?">
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setForm({ ...form, current_focus: opt })}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      form.current_focus === opt
                        ? 'border-primary/40 bg-primary/15 text-foreground'
                        : 'border-border/40 bg-card/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Why now?" hint="A few sentences. What pulled you here?">
              <textarea
                value={form.why}
                onChange={(e) => setForm({ ...form, why: e.target.value })}
                rows={4}
                className="iw-input resize-none"
                placeholder="What you're navigating, what you're hoping to soften…"
                required
                minLength={20}
              />
            </Field>

            <Field label="Practice context" hint="Optional. Any prior work — therapy, meditation, somatic, etc.">
              <textarea
                value={form.practice_context}
                onChange={(e) => setForm({ ...form, practice_context: e.target.value })}
                rows={2}
                className="iw-input resize-none"
                placeholder="A sentence or two."
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Submit application'}
            </button>

            <p className="text-center text-[11px] text-muted-foreground/70">
              Submitting doesn't charge anything. If accepted, we'll send you a private founding-member checkout link.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <div className="space-y-1">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        {hint && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
      </div>
      {children}
    </label>
  );
}
