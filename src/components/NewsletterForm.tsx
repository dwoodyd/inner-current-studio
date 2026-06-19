import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewsletterFormProps {
  source?: string;
  title?: string;
  subtitle?: string;
}

export default function NewsletterForm({
  source = 'landing',
  title = 'Get early access.',
  subtitle = 'Soft notes from the practice — new rituals, reflections, and quiet updates. No noise.',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || trimmed.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email: trimmed, source },
      });
      if (error) throw error;
      setDone(true);
      setEmail('');
      toast.success('You\'re on the list.');
    } catch {
      toast.error('Could not subscribe. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur md:p-10"
    >
      <div className="text-center">
        <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {done ? (
        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-full border border-soul-gold/40 bg-soul-gold/10 px-4 py-3 text-sm text-soul-gold">
          <Check className="h-4 w-4" /> You're on the list. Watch your inbox.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            maxLength={255}
            aria-label="Email address"
            className="h-12 rounded-full bg-background/60 px-5"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 rounded-full bg-soul-gold text-background hover:bg-soul-gold/90 uppercase tracking-[0.18em] text-xs font-medium px-6"
          >
            {loading ? 'Joining…' : (<>Join <ArrowRight className="ml-2 h-4 w-4" /></>)}
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground/80">
        No account required. Unsubscribe any time.
      </p>
    </motion.div>
  );
}
