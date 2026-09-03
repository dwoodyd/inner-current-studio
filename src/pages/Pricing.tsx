import { Link } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';

/**
 * Public pricing page — reachable without an account.
 * Amounts here must match the live Paddle catalog.
 */
const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'One practice a day, no card required.',
    features: [
      'Daily emotional check-in',
      'One guided practice per day',
      'The Center breathing room',
      'Your own private history',
    ],
  },
  {
    name: 'Pro · Monthly',
    price: '$4.99',
    period: 'per month',
    note: 'Founding rate · $7.99/mo once the founding window closes',
    tagline: 'Every current, every ritual, unlimited.',
    highlight: true,
    features: [
      'Unlimited practices, all five Currents',
      'Guided sequences and reality scripting',
      'AI affirmation coach and current guide',
      'Reminders, exports, and full history',
      'Cancel anytime',
    ],
  },
  {
    name: 'Pro · Annual',
    price: '$39',
    period: 'per year',
    note: 'Founding rate · $59/yr once the founding window closes',
    tagline: 'Everything in Pro, about $3.25 a month.',
    features: ['Everything in Pro Monthly', 'Two months free vs. monthly', 'Cancel anytime'],
  },
  {
    name: 'Lifetime',
    price: '$99',
    period: 'one-time',
    note: 'Founding 100 only — retiring when the slots fill',
    tagline: 'One charge. Never billed again.',
    features: ['Everything in Pro, permanently', 'Founding Member badge', 'All future Currents included'],
  },
];

export default function Pricing() {
  return (
    <main className="relative min-h-[100dvh] pb-24">
      <div className="mx-auto max-w-3xl space-y-8 px-5 pt-12 safe-top">
        <header className="space-y-3 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Inner Wake pricing
          </h1>
          <p className="mx-auto max-w-[420px] font-heading text-base italic leading-relaxed text-muted-foreground">
            Start free. Upgrade only if the practice earns it. No dark patterns, no hidden fees.
          </p>
          <p className="text-xs text-muted-foreground/80">All prices in USD. Taxes calculated at checkout.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <section
              key={tier.name}
              className={`soul-glass flex flex-col gap-4 rounded-2xl p-6 ${
                tier.highlight ? 'border border-primary/30' : 'border border-border/20'
              }`}
            >
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-medium text-foreground">{tier.name}</h2>
                <p className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-semibold text-foreground">{tier.price}</span>
                  <span className="text-xs text-muted-foreground">{tier.period}</span>
                </p>
                {tier.note && <p className="text-[11px] text-muted-foreground/80">{tier.note}</p>}
                <p className="pt-1 text-sm text-muted-foreground">{tier.tagline}</p>
              </div>
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link
            to="/auth"
            className="press inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground"
          >
            Create your free account
          </Link>
          <p className="text-xs text-muted-foreground/80">No card needed to start.</p>
        </div>

        <section className="soul-glass flex items-start gap-3 rounded-2xl px-5 py-4">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Inner Wake is operated by DeWayne Woods, sole proprietor. Our order process is conducted by our online
            reseller <strong className="font-medium text-foreground">Paddle.com Market Limited</strong>, the Merchant of
            Record for all orders. Paddle handles checkout, billing, sales tax, invoices, refunds, and buyer support.
            Subscriptions renew automatically at the then-current price until cancelled; cancel any time from your
            profile or at paddle.net.
          </p>
        </section>

        <nav className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/80">
          <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>
          <Link to="/refund" className="underline underline-offset-4 hover:text-foreground">Refund policy</Link>
          <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link>
          <a
            href="https://www.paddle.com/legal/checkout-buyer-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Paddle Buyer Terms
          </a>
          <Link to="/welcome" className="underline underline-offset-4 hover:text-foreground">Home</Link>
        </nav>
      </div>
    </main>
  );
}
