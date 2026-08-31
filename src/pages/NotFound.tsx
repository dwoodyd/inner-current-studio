import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <section aria-labelledby="notfound-heading" className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-16 text-center safe-x safe-top">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,hsl(var(--primary)/0.10),transparent_55%),radial-gradient(circle_at_80%_90%,hsl(var(--secondary)/0.06),transparent_50%)]" />
      <section className="relative w-full max-w-[32rem]">
        <div className="relative mx-auto mb-10 h-[7.5rem] w-[7.5rem]">
          <div className="absolute -inset-4 rounded-full border border-primary/15 animate-pulse-gentle" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--muted)),hsl(var(--card))_60%,hsl(var(--background))_100%)] shadow-[0_0_60px_hsl(var(--primary)/0.12),inset_0_0_24px_hsl(var(--background)/0.65)]" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary))]" />
        </div>

        <h1 id="notfound-heading" className="font-heading text-[2.75rem] font-medium leading-tight text-foreground">
          This page is <em className="font-medium text-primary">quiet</em>.
        </h1>
        <p className="mx-auto mt-3 max-w-[26rem] font-heading text-xl italic leading-relaxed text-muted-foreground">
          The path you were on isn't here — but you are. That's enough to begin again.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            Return to your practice
            <ArrowRight size={15} />
          </Link>
          <Link to="/reset/stillness" className="inline-flex min-h-[48px] items-center rounded-full border border-border/50 px-6 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground">
            Take a breath instead
          </Link>
        </div>

        <nav aria-label="Suggested practices" className="mx-auto mt-8 grid max-w-[22.5rem] gap-2 text-left">
          {[
            ["Pattern Mirror", "your rhythms · 30s", "/reflect/patterns"],
            ["Stillness", "90 seconds · no fixing", "/reset/stillness"],
            ["Future Pages", "when relief became real", "/reflect/future-pages"],
          ].map(([name, meta, to]) => (
            <Link key={to} to={to} className="flex items-baseline justify-between gap-4 rounded-xl border border-border/50 bg-card/35 px-3.5 py-2.5 transition-colors hover:bg-card/60">
              <span className="font-heading text-base text-foreground">{name}</span>
              <span className="shrink-0 text-[11px] tracking-wide text-muted-foreground/60">{meta}</span>
            </Link>
          ))}
        </nav>

        <p className="mt-6 border-t border-border/50 pt-6 font-heading text-sm italic leading-relaxed text-muted-foreground/60">
          “Returning often is more powerful than staying long.”
        </p>
      </section>
    </section>
  );
};

export default NotFound;
