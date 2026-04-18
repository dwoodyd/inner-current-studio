import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Moon, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DOMAINS, ALL_DOMAIN_KEYS } from '@/lib/domains';

const TITLE = 'Inner Wake — A quiet practice space for emotional clarity';
const DESC =
  'Inner Wake is a premium ritual app for emotional clarity. Soften resistance, return to center, and tend five life Currents: Self, Energy, Relationships, Health, and Money.';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function Welcome() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = TITLE;
    setMeta('description', DESC);
    setMeta('og:title', TITLE, 'property');
    setMeta('og:description', DESC, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', TITLE);
    setMeta('twitter:description', DESC);
    setLink('canonical', `${window.location.origin}/welcome`);

    const ldId = 'ld-welcome';
    document.getElementById(ldId)?.remove();
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = ldId;
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Inner Wake',
      description: DESC,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android (PWA)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      document.getElementById(ldId)?.remove();
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(42 65% 58% / 0.18), transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-24 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(280 50% 60% / 0.16), transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-10 md:pt-16">
        {/* Nav */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full"
              style={{ background: 'radial-gradient(circle at 40% 35%, hsl(42 65% 58% / 0.55), hsl(42 65% 58% / 0.1))' }}
            />
            <span className="font-serif text-xl tracking-wide">Inner Wake</span>
          </div>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
        </header>

        {/* Hero */}
        <section className="mt-16 md:mt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" /> A quiet practice space, not another productivity app
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mt-6 font-serif text-4xl leading-tight md:text-6xl md:leading-tight"
          >
            Return to <span className="italic text-soul-gold">center</span>,<br />
            one current at a time.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Inner Wake is a gentle ritual app for emotional clarity. Soften resistance, saturate in
            affirmations that actually feel true, and tend five Currents of your life — without
            hustle, hype, or toxic positivity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="bg-soul-gold text-background hover:bg-soul-gold/90 px-8">
              <Link to="/auth">
                Begin your practice <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="#currents">See the five Currents</a>
            </Button>
          </motion.div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free to start · Works offline · Installs as an app
          </p>
        </section>

        {/* Currents */}
        <section id="currents" className="mt-28">
          <div className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl">Five Currents. One quiet practice.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Each Current has its own check-in, affirmations, gather flow, resistance release,
              openings, and evidence log. Tend the one that's calling you today.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_DOMAIN_KEYS.map((key, i) => {
              const d = DOMAINS[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-all hover:border-border"
                  style={{ background: d.gradient }}
                >
                  <div className="text-3xl">{d.emoji}</div>
                  <h3 className="mt-4 font-serif text-xl">{d.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.tagline}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Social proof / voices */}
        <section className="mt-28">
          <div className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl">Made for the quietly devoted.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Early voices from the practice.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                quote:
                  'It feels like the only app that actually meets me where I am instead of pushing me to perform.',
                who: 'Maya · early reader',
              },
              {
                quote:
                  'The Money Current shifted something I have been white-knuckling for years. Softer, not harder.',
                who: 'J. · beta tester',
              },
              {
                quote:
                  'I keep coming back at night. It is the most peaceful thing on my phone.',
                who: 'Ana · beta tester',
              },
            ].map((t, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur"
              >
                <blockquote className="font-serif text-lg leading-relaxed text-foreground/90">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                  {t.who}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="mt-28 grid gap-4 md:grid-cols-3">
          {[
            { icon: Moon, title: 'Emotion-first', body: 'Every entry begins with how you feel — not what you owe yourself.' },
            { icon: Shield, title: 'Private by design', body: 'Your reflections stay yours. Local-first, end-to-end gentle.' },
            { icon: Wifi, title: 'Always with you', body: 'Installs as an app. Works offline. Syncs when you return.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur">
              <Icon className="h-5 w-5 text-soul-gold" />
              <h3 className="mt-3 font-serif text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        {/* Final CTA */}
        <section className="mt-28 rounded-3xl border border-border/60 bg-card/40 p-10 text-center backdrop-blur md:p-16">
          <h2 className="font-serif text-3xl md:text-5xl">
            Your practice is <span className="italic text-soul-gold">already inside you</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Inner Wake is the quiet room you return to. Free to begin. Yours to keep.
          </p>
          <Button asChild size="lg" className="mt-8 bg-soul-gold text-background hover:bg-soul-gold/90 px-10">
            <Link to="/auth">
              Create your free account <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </section>

        <footer className="mt-20 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Inner Wake. A quiet practice.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
