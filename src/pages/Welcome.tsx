import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Eye, Moon, Play, Shield, Sparkles, Timer, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DOMAINS, ALL_DOMAIN_KEYS } from '@/lib/domains';
import InnerWakeOnboarding from '@/components/onboarding/InnerWakeOnboarding';
import NewsletterForm from '@/components/NewsletterForm';
import innerWakeIcon from '@/assets/inner-wake-orb-logo.png';

const SEEN_KEY = 'iw_cinematic_seen_v1';

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
  const navigate = useNavigate();
  const [centerSeconds, setCenterSeconds] = useState(10);
  const [centering, setCentering] = useState(false);
  const [activePractitioners, setActivePractitioners] = useState(() => 14 + (new Date().getMinutes() % 9));
  const [showCinematic, setShowCinematic] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return !localStorage.getItem(SEEN_KEY); } catch { return false; }
  });

  const centerPrompt = centerSeconds > 6 ? 'Inhale softly' : centerSeconds > 3 ? 'Let your shoulders drop' : 'Return to here';

  const dismissCinematic = (goToAuth: boolean) => {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
    setShowCinematic(false);
    if (goToAuth) navigate('/auth');
  };

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

  useEffect(() => {
    const id = window.setInterval(() => {
      const minute = new Date().getMinutes();
      setActivePractitioners(14 + (minute % 9));
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!centering) return;

    const id = window.setInterval(() => {
      setCenterSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(id);
          setCentering(false);
          return 10;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [centering]);

  const startCentering = () => {
    setCenterSeconds(10);
    setCentering(true);
  };

  const startOnboarding = () => {
    try { localStorage.removeItem(SEEN_KEY); } catch {}
    setShowCinematic(true);
  };

  if (showCinematic) {
    return (
      <InnerWakeOnboarding
        onComplete={() => dismissCinematic(true)}
        onSkip={() => dismissCinematic(false)}
      />
    );
  }

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
            <img src={innerWakeIcon} alt="" aria-hidden="true" className="h-9 w-9 object-contain" />
            <span className="font-serif text-xl tracking-wide">Inner Wake</span>
          </div>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
        </header>

        {/* Hero */}
        <section className="mt-14 text-center md:mt-24">
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
            className="mt-6 font-serif text-[2.6rem] leading-[1.08] md:text-6xl md:leading-tight"
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
            Inner Wake is a gentle ritual app for emotional clarity. Soften resistance, return to center,
            and tend the five Currents of your life — without hustle, hype, or toxic positivity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="rounded-full bg-soul-gold text-background hover:bg-soul-gold/90 uppercase tracking-[0.18em] text-sm font-medium shadow-[0_8px_32px_hsl(42_65%_58%_/0.25)] hover:shadow-[0_12px_40px_hsl(42_65%_58%_/0.35)] transition-all px-10 py-6 h-auto"
            >
              BEGIN YOUR PRACTICE <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={startOnboarding}
              variant="ghost"
              size="lg"
              className="rounded-full uppercase tracking-[0.18em] text-xs font-medium"
            >
              Replay intro
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="#currents">See the five Currents</a>
            </Button>
          </motion.div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free to start · Works offline · Installs as an app
          </p>
        </section>

        {/* Newsletter / early access */}
        <section className="mt-16">
          <NewsletterForm source="welcome-hero" />
        </section>

        {/* Instant practice hook */}
        <section className="mt-16 grid gap-4 md:grid-cols-[1.05fr_0.95fr] md:items-stretch">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <Timer className="h-4 w-4 text-soul-gold" /> 10-second center
            </div>
            <div className="mt-6 flex items-center gap-5">
              <motion.button
                type="button"
                onClick={startCentering}
                disabled={centering}
                className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-colors hover:bg-primary/15 disabled:cursor-default"
                animate={centering ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 3, repeat: centering ? Infinity : 0, ease: 'easeInOut' }}
                aria-label="Start 10-second center"
              >
                {centering ? <span className="font-serif text-3xl">{centerSeconds}</span> : <Play className="h-7 w-7 fill-current" />}
              </motion.button>
              <div>
                <h2 className="font-serif text-2xl">Try a quiet return.</h2>
                <p className="mt-2 text-sm text-muted-foreground">{centering ? centerPrompt : 'A small reset before you create an account.'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <Activity className="h-4 w-4 text-soul-gold" /> Quiet community
            </div>
            <p className="mt-6 font-serif text-4xl text-foreground">{activePractitioners}</p>
            <p className="mt-2 text-sm text-muted-foreground">people are practicing right now.</p>
            <p className="mt-4 text-xs text-muted-foreground/80">12,400+ returns to center and counting.</p>
          </div>
        </section>

        {/* Interface preview */}
        <section className="mt-28 grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Eye className="h-3.5 w-3.5" /> Look inside
            </div>
            <h2 className="mt-5 font-serif text-3xl md:text-4xl">A daily dashboard for your inner weather.</h2>
            <p className="mt-3 text-muted-foreground">
              Open the Current that needs care, check your state, then move into a ritual that meets the moment.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <p className="font-serif text-xl">Currents</p>
                <p className="text-xs text-muted-foreground">Today’s practice field</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary select-none">Preview</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ALL_DOMAIN_KEYS.slice(0, 4).map((key) => {
                const d = DOMAINS[key];
                return (
                  <div key={key} className="rounded-xl border border-border/50 bg-background/30 p-4 select-none" style={{ background: d.gradient }}>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{d.emoji}</span>
                      <span className="h-2 w-2 rounded-full bg-primary/70" />
                    </div>
                    <h3 className="mt-3 font-serif text-lg">{d.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">A quick doorway into today’s practice.</p>
                  </div>
                );
              })}
            </div>
          </div>
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
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => navigate('/auth')}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-all hover:border-border text-left"
                  style={{ background: d.gradient }}
                  aria-label={`${d.label} — sign up to open`}
                >
                  <div className="text-3xl">{d.emoji}</div>
                  <h3 className="mt-4 font-serif text-xl">{d.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.tagline}</p>
                </motion.button>
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

        {/* Pricing — three-tier (Free / Pro / Lifetime) */}
        <section id="pricing" className="mt-28">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-soul-gold">Three ways in.</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Simple, honest pricing.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Begin free. Lock a founding rate when you're ready — yours for life.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                badge: null as string | null,
                tagline: 'Begin the practice. No card required.',
                bullets: [
                  'Living Orb · energy check-ins',
                  'Money Current — fully open',
                  '1 daily Alignment Wheel · Breathwork · Reset',
                  '3 daily Current Guide reflections',
                  'Stillness Timer — unlimited',
                ],
                cta: 'Begin free',
              },
              {
                name: 'Pro Annual',
                price: '$39',
                period: '/ year',
                badge: 'Founding Rate · Best Value',
                tagline: '$59/yr retail after beta · ≈ $3.25/mo',
                bullets: [
                  'Everything in Free, unlimited',
                  'Money current open · custom Sigils · more Currents rolling out',
                  'Resonance Library · Practice Constellation',
                  'Pattern Mirror — multi-month history',
                  'Save 35% vs monthly',
                ],
                cta: 'Reserve Pro Annual',
                highlight: true,
              },
              {
                name: 'Pro Lifetime',
                price: '$99',
                period: 'one-time',
                badge: 'Founder-only · 100 slots',
                tagline: 'Retiring with the founding member program.',
                bullets: [
                  'Everything in Pro',
                  'Never billed again',
                  'Founding Member badge',
                  'Direct line to DeWayne (quarterly)',
                  'Free copy of Before the Words at release',
                ],
                cta: 'Lock in Lifetime $99',
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border bg-card/40 p-6 backdrop-blur ${
                  (tier as any).highlight
                    ? 'border-soul-gold/60 shadow-[0_0_40px_-10px_hsl(42_65%_58%/0.3)]'
                    : 'border-border/60'
                }`}
              >
                {tier.badge && (
                  <div className="mb-3 inline-block rounded-full bg-soul-gold/15 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-soul-gold">
                    {tier.badge}
                  </div>
                )}
                <h3 className="font-serif text-xl">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{tier.tagline}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-foreground/85">
                  {tier.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-soul-gold/70" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="sm"
                  variant={(tier as any).highlight ? 'default' : 'outline'}
                  className={`mt-5 w-full ${(tier as any).highlight ? 'bg-soul-gold text-background hover:bg-soul-gold/90' : ''}`}
                >
                  <Link to="/auth">{tier.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Founding rates are locked for life. Prices in USD. Billing handled securely by our reseller, Paddle.
            See our{' '}
            <Link to="/refund" className="underline hover:text-foreground">refund policy</Link> and{' '}
            <Link to="/terms" className="underline hover:text-foreground">terms</Link>.
          </p>
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
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem(SEEN_KEY); } catch {}
                setShowCinematic(true);
              }}
              className="hover:text-foreground transition-colors"
            >
               Replay opening ritual
            </button>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/refund" className="hover:text-foreground">Refunds</Link>
            <Link to="/auth" className="hover:text-foreground">Sign in</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
